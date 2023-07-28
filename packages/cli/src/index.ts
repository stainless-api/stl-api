#!/usr/bin/env node

import * as tm from "ts-morph";
import { ts } from "ts-morph";
const { factory } = ts;
import pkgUp from "pkg-up";
import Path from "path";
import fs from "fs";

import chalk from "chalk";

import { convertType } from "ts-to-zod";
import {
  ConvertTypeContext,
  SchemaGenContext,
  ImportInfo,
  NamespaceImportInfo,
  convertSymbol,
  ErrorAbort,
  Incident,
  Diagnostics,
  processModuleIdentifiers,
} from "ts-to-zod/dist/convertType";

import {
  generateFiles,
  generateImportStatements,
  generatePath,
  relativeImportPath,
} from "ts-to-zod/dist/generateFiles";

import {
  GenOptions,
  GenerationConfig,
  createGenerationConfig,
} from "ts-to-zod/dist/filePathConfig";

import { Watcher, type Event } from "./watch";
import {
  EndpointTypeInstance,
  NodeType,
  preprocessEndpoint,
} from "./endpointPreprocess";

import { program as argParser } from "commander";
import {
  convertPathToImport,
  isSymbolStlMethod,
  mangleRouteToIdentifier,
  statOrExit,
} from "./utils";
import { format } from "./format";
import { debug } from "./debug";

// TODO: add dry run functionality?
argParser.option("-w, --watch", "enables watch mode");
argParser.option(
  "-d, --directory <path>",
  "the directory to generate schemas for",
  "."
);
argParser.option(
  "-o, --outdir <path>",
  "the directory in which to generate schemas",
  ".stl-codegen"
);
argParser.allowExcessArguments(false);

interface CallDiagnostics {
  line: number;
  column: number;
  filePath: string;
  diagnostics: Map<string, Diagnostics>;
}

interface EndpointCall {
  endpointPath: string;
  schemaExpression: ts.Expression;
}

async function main() {
  argParser.parse();
  const options = argParser.opts();

  const directoryStat = await statOrExit(options.directory);
  if (!directoryStat.isDirectory()) {
    console.error(`Error: '${options.directory} is not a directory.`);
    process.exit(1);
  }

  const packageJsonPath = await pkgUp({
    cwd: options.directory,
  });
  if (!packageJsonPath) {
    console.error(
      `Folder ${Path.relative(
        ".",
        options.directory
      )} and its parent directories do not contain a package.json.`
    );
    process.exit(1);
  }
  const rootPath = Path.dirname(packageJsonPath);

  const tsConfigFilePath = Path.relative(
    ".",
    Path.join(rootPath, "tsconfig.json")
  );
  const tsConfigStat = await statOrExit(tsConfigFilePath);
  if (!tsConfigStat.isFile()) {
    console.error(`Error: '${tsConfigFilePath}' is not a file.`);
  }

  const generationOptions = {
    genLocation: {
      type: "folder",
      genPath: options.outdir,
    },
    rootPath,
    zPackage: "stainless",
  } as const;
  const generationConfig = createGenerationConfig(generationOptions);

  let watcher: Watcher | undefined;
  if (options.watch) {
    watcher = new Watcher(rootPath, generationConfig.basePath);
  }

  const project =
    watcher?.project ||
    new tm.Project({
      // TODO: should file path be configurable?
      tsConfigFilePath,
    });

  const baseCtx = new SchemaGenContext(project);

  const printer = tm.ts.createPrinter();

  if (watcher) {
    const events: Event[] = [];

    let evaluateRequested = false;
    let evaluating = false;

    const evaluateSoon = async () => {
      evaluateRequested = true;
      if (evaluating) return;
      try {
        evaluating = true;
        while (evaluateRequested) {
          // debounce half a second
          await new Promise((resolve) => setTimeout(resolve, 500));
          evaluateRequested = false;

          const elapsedEvents = [...events];
          events.length = 0;

          if (!elapsedEvents.length) break;

          const { path } = elapsedEvents[0];

          if (!debug.enabled) console.clear();
          const relativePath = Path.relative(".", path);
          const changeDescription = `${relativePath}${
            elapsedEvents.length > 1
              ? ` and ${elapsedEvents.length - 1} other path${
                  elapsedEvents.length === 2 ? "" : "s"
                }`
              : ""
          }`;
          console.log(`${changeDescription} changed, processing...`);
          try {
            const succeeded = await evaluate(
              project,
              baseCtx,
              generationConfig,
              printer,
              options.outdir,
              {
                isDirty: () => evaluateRequested,
              }
            );
            if (succeeded) {
              if (!debug.enabled) console.clear();
              console.log(`Successfully processed ${changeDescription}.`);
            } else {
              events.unshift(...elapsedEvents);
            }
          } catch (error) {
            // ignore
          }
        }
        console.log("Watching for file changes...");
      } finally {
        evaluating = false;
      }
    };

    await evaluateSoon();

    for await (const event of watcher.getEvents()) {
      events.push(event);
      evaluateSoon();
    }
  } else {
    const succeeded = await evaluate(
      project,
      baseCtx,
      generationConfig,
      printer,
      options.outdir
    );
    if (!succeeded) {
      process.exit(1);
    }
  }
}

(async () => {
  await main();
})()
  .then()
  .catch(console.log);

function generateIncidentLocation(
  filePath: string,
  incident: Incident
): string {
  const position = incident.position
    ? `${incident.position.startLine}:${incident.position.startColumn}:`
    : "";
  return chalk.gray(`${filePath}:${position}`);
}

/** returns true on successful generation of files, false otherwise */
async function evaluate(
  project: tm.Project,
  baseCtx: SchemaGenContext,
  generationConfig: GenerationConfig,
  printer: ts.Printer,
  outdir: string,
  { isDirty = () => false }: { isDirty?: () => boolean } = {}
): Promise<boolean> {
  // accumulated diagnostics to emit
  const callDiagnostics: CallDiagnostics[] = [];
  // every stl.types.endpoint call found per file
  const endpointCalls: Map<tm.SourceFile, EndpointCall[]> = new Map();

  // a list of closures to call to modify the file before saving it
  // performs modifications that invalidate ast information after
  // all tree visiting is complete
  const fileOperations: (() => void)[] = [];
  // file import operations can be file position sensitive, so they're performed first
  const fileImportOperations: (() => void)[] = [];

  for (const file of project.getSourceFiles()) {
    const ctx = new ConvertTypeContext(baseCtx, file);
    const imports = new Map<string, ImportInfo>();
    const namespacedImports = new Map<string, NamespaceImportInfo>();
    let hasCodegenSchemaCall = false;

    for (const callExpression of file.getDescendantsOfKind(
      ts.SyntaxKind.CallExpression
    )) {
      ctx.generateInUserFile = false;

      const receiverExpression = callExpression.getExpression();
      const symbol = receiverExpression.getSymbol();
      if (!symbol || !isSymbolStlMethod(symbol)) continue;

      const methodName = symbol.getEscapedName();

      if (!(methodName === "codegenSchema" || methodName === "endpoint"))
        continue;

      if (methodName == "endpoint") {
        const call = preprocessEndpoint(callExpression);
        if (!call) continue;
        const fileCalls = getOrInsert(endpointCalls, file, () => []);

        let endpointSchema: ts.Expression;
        try {
          endpointSchema = convertEndpointCall(
            ctx,
            call,
            file,
            callDiagnostics
          );
        } catch (e) {
          if (e instanceof ErrorAbort) {
            break;
          } else throw e;
        } finally {
          addDiagnostics(ctx, file, callExpression, callDiagnostics);
        }
        fileCalls.push({
          endpointPath: call.endpointPath,
          schemaExpression: endpointSchema,
        });
        const ctxFile = getOrInsert(ctx.files, file.getFilePath(), () => ({
          imports: new Map(),
          generatedSchemas: new Map(),
        }));
        const name = mangleRouteToIdentifier(call.endpointPath);
        ctxFile.generatedSchemas.set(name, {
          name,
          expression: endpointSchema,
          isExported: true,
          /** non-user-visible value should not be generated in .d.ts */
          private: true,
          type: factory.createTypeReferenceNode("any"),
        });
        continue;
      }

      // Handle stl.codegenSchema call
      const typeRefArguments = callExpression.getTypeArguments();
      if (typeRefArguments.length != 1) continue;
      hasCodegenSchemaCall = true;

      const [typeArgument] = typeRefArguments;

      const type = typeArgument.getType();
      let schemaExpression: ts.Expression;

      ctx.isRoot = true;
      ctx.diagnostics = new Map();

      const diagnosticItem = {
        variant: "node",
        node: typeArgument,
      } as const;

      if (
        typeArgument instanceof tm.TypeReferenceNode &&
        typeArgument.getTypeArguments().length === 0
      ) {
        const symbol = typeArgument.getTypeName().getSymbolOrThrow();
        try {
          convertSymbol(ctx, symbol, diagnosticItem);
        } catch (e) {
          if (e instanceof ErrorAbort) break;
          else throw e;
        } finally {
          addDiagnostics(ctx, file, callExpression, callDiagnostics);
        }
        const name = symbol.getName();
        const declaration = symbol.getDeclarations()[0];
        const declarationFilePath = declaration.getSourceFile().getFilePath();

        if (declarationFilePath === file.getFilePath()) {
          imports.set(symbol.getName(), {
            as: `${name}Schema`,
            sourceFile: declarationFilePath,
          });
        }
        const schemaName = `${name}Schema`;
        schemaExpression = factory.createIdentifier(schemaName);
      } else {
        try {
          ctx.generateInUserFile = true;
          schemaExpression = convertType(ctx, type, diagnosticItem);
        } catch (e) {
          if (e instanceof ErrorAbort) break;
          else throw e;
        } finally {
          addDiagnostics(ctx, file, callExpression, callDiagnostics);
        }
      }

      // remove all arguments to codegenSchema function
      for (
        let argumentLength = callExpression.getArguments().length;
        argumentLength > 0;
        argumentLength--
      ) {
        fileOperations.push(() =>
          callExpression.removeArgument(argumentLength - 1)
        );
      }

      // fill in generated schema expression
      fileOperations.push(() =>
        callExpression.addArgument(
          printer.printNode(
            ts.EmitHint.Unspecified,
            schemaExpression,
            file.compilerNode
          )
        )
      );
    }

    const fileInfo = ctx.files.get(file.getFilePath());
    if (fileInfo) {
      processModuleIdentifiers(fileInfo);
    }

    if (!hasCodegenSchemaCall) continue;

    // Get the imports needed for the current file, any
    if (fileInfo) {
      for (const [name, importInfo] of fileInfo.imports) {
        // Don't include imports that would import from the file we're
        // currently processing. This is relevant when handling enums and
        // classes.
        // TODO: is handling multiple declarations relevant here?
        if (!importInfo.excludeFromUserFile) {
          imports.set(name, {
            ...importInfo,
            importFromUserFile: false,
          });
        }
      }
    }

    // add new imports necessary for schema generation
    let importDeclarations = generateImportStatements(
      generationConfig,
      file.getFilePath(),
      imports,
      namespacedImports
    );

    let hasZImport = false;

    // maps module specifier to statement position
    const currentImports = new Map<string, tm.ImportDeclaration>();

    let lastImportPosition = -1;

    // catalog all existing codegen imports
    for (const [idx, statement] of file.getStatements().entries()) {
      if (statement instanceof tm.ImportDeclaration) {
        lastImportPosition = idx;
        const moduleSpecifier = statement
          .getModuleSpecifier()
          .getLiteralValue();
        const sourcePath = statement
          .getModuleSpecifierSourceFile()
          ?.getFilePath();
        if (
          sourcePath?.startsWith(generationConfig.basePath) ||
          sourcePath?.startsWith(generationConfig.baseDependenciesPath)
        ) {
          currentImports.set(moduleSpecifier, statement);
        } else if (moduleSpecifier === "stainless") {
          for (const specifier of statement.getNamedImports()) {
            if (specifier.getName() === "z") {
              hasZImport = true;
            }
          }
        }
      }
    }

    // don't import "z" if it's already imported in the file
    if (hasZImport) {
      importDeclarations = importDeclarations.slice(1);
    }

    for (const declaration of importDeclarations) {
      const moduleSpecifier = (declaration.moduleSpecifier as ts.StringLiteral)
        .text;
      const importDeclarationReference = currentImports.get(moduleSpecifier);
      const importString = printer.printNode(
        ts.EmitHint.Unspecified,
        declaration,
        file.compilerNode
      );
      // if the file already contains an import declaration with the given module specifier,
      // replace it with the new declaration
      if (importDeclarationReference !== undefined) {
        fileImportOperations.push(() => {
          importDeclarationReference.replaceWithText(importString);
          // file.removeStatement(pos);
          // file.insertStatements(pos, importString);
        });
        currentImports.delete(moduleSpecifier);
      } else {
        // if the file doesn't currently have such a declaration, add one
        fileImportOperations.push(() => {
          file.insertStatements(++lastImportPosition, importString);
        });
      }
    }

    // remove all of the now-unneeded codegen import declarations
    for (const importDeclaration of currentImports.values()) {
      // TODO: disabled due to removal of used import statements
      // fileImportOperations.push(() => importDeclaration.remove());
    }
  }

  // Commit all operations potentially destructive to AST visiting.
  fileImportOperations.forEach((op) => op());
  fileOperations.forEach((op) => op());

  const generatedFileContents = generateFiles(baseCtx, generationConfig);

  if (callDiagnostics.length) {
    const output = [];
    let errorCount = 0;
    let warningCount = 0;

    for (const { filePath, line, column, diagnostics } of callDiagnostics) {
      output.push(
        chalk.magenta(
          `While processing codegenSchema call at ${Path.relative(
            ".",
            filePath
          )}:${line}:${column}:`
        )
      );
      for (const [filePath, fileDiagnostics] of diagnostics) {
        errorCount += fileDiagnostics.errors.length;
        warningCount += fileDiagnostics.warnings.length;

        for (const warning of fileDiagnostics.warnings) {
          output.push(
            generateIncidentLocation(Path.relative(".", filePath), warning)
          );
          output.push(
            chalk.yellow("warning: ") +
              warning.message +
              generateDiagnosticDetails(warning)
          );
        }

        for (const error of fileDiagnostics.errors) {
          output.push(
            generateIncidentLocation(Path.relative(".", filePath), error)
          );
          output.push(
            chalk.red("error: ") +
              error.message +
              generateDiagnosticDetails(error)
          );
        }
      }
    }

    let diagnosticSummary;

    if (errorCount > 0 && warningCount > 0) {
      diagnosticSummary =
        "Encountered " +
        chalk.red(`${errorCount} error${errorCount === 1 ? "" : "s"} `) +
        "and " +
        chalk.yellow(
          `${warningCount} warning${warningCount === 1 ? "" : "s"}`
        ) +
        ".";
    } else if (errorCount > 0) {
      diagnosticSummary =
        "Encountered " +
        chalk.red(`${errorCount} error${errorCount === 1 ? "" : "s"}`) +
        ".";
    } else {
      diagnosticSummary =
        "Encountered " +
        chalk.yellow(
          `${warningCount} warning${warningCount === 1 ? "" : "s"}`
        ) +
        ".";
    }

    for (const line of output) {
      console.log(line);
    }
    console.log();
    console.log(diagnosticSummary);

    if (errorCount > 0) {
      console.log("No modifications were made to package source.");
      return false;
    }
  }

  // since everything above is sync but potentially slow,
  // yield for a moment to find out if the user has changed anything
  // else before writing files
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (isDirty()) return false;

  // Generate index.ts
  if (endpointCalls.size) {
    const mapEntries = [];

    const endpointMapGenPath = Path.join(generationConfig.basePath, "index.ts");

    for (const [file, calls] of endpointCalls) {
      for (const call of calls) {
        const mangledName = mangleRouteToIdentifier(call.endpointPath);
        const importExpression = factory.createCallExpression(
          factory.createToken(ts.SyntaxKind.ImportKeyword) as ts.Expression,
          undefined,
          [
            factory.createStringLiteral(
              `${relativeImportPath(
                endpointMapGenPath,
                convertPathToImport(
                  generatePath(file.getFilePath(), generationConfig)
                )
              )}.js`
            ),
          ]
        );
        const callExpression = factory.createCallExpression(
          factory.createPropertyAccessExpression(importExpression, "then"),
          undefined,
          [
            factory.createArrowFunction(
              undefined,
              undefined,
              [factory.createParameterDeclaration(undefined, undefined, "mod")],
              undefined,
              undefined,
              factory.createPropertyAccessExpression(
                factory.createIdentifier("mod"),
                mangledName
              )
            ),
          ]
        );
        const entry = factory.createPropertyAssignment(
          factory.createStringLiteral(call.endpointPath),
          createThunk(callExpression)
        );
        mapEntries.push(entry);
      }
    }

    const mapDeclaration = factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          "typeSchemas",
          undefined,
          undefined,
          factory.createObjectLiteralExpression(mapEntries)
        ),
      ],
      ts.NodeFlags.Const
    );
    const mapStatement = factory.createVariableStatement(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      mapDeclaration
    );

    const mapSourceFile = factory.createSourceFile(
      [mapStatement],
      factory.createToken(ts.SyntaxKind.EndOfFileToken),
      0
    );

    await fs.promises.mkdir(generationConfig.basePath, { recursive: true });

    await fs.promises.writeFile(
      endpointMapGenPath,
      await format(printer.printFile(mapSourceFile), endpointMapGenPath)
    );
  }

  for (const [file, fileStatments] of generatedFileContents) {
    const fileDir = Path.dirname(file);
    // creates directory where to write file to, if it doesn't already exist
    await fs.promises.mkdir(fileDir, {
      recursive: true,
    });

    const sourceFile = factory.createSourceFile(
      fileStatments,
      factory.createToken(ts.SyntaxKind.EndOfFileToken),
      0
    );

    // write sourceFile to file
    await fs.promises.writeFile(
      file,
      await format(printer.printFile(sourceFile), file)
    );
  }

  project.save();
  return true;
}

function generateDiagnosticDetails({
  position,
  name,
  typeText,
  propertyName,
}: Incident): string {
  let typeDescriptor;
  if (typeText && (!name || name === "__type")) typeDescriptor = typeText;
  else typeDescriptor = name;

  if (typeDescriptor && propertyName) {
    return chalk`\nin type of property {cyan \`${propertyName}\`} of type {cyan \`${typeDescriptor}\`}`;
  } else if (name) {
    return chalk`\nwhile processing type {cyan \`${typeDescriptor}\`}`;
  } else if (position) {
    return "";
  } else return "at an unknown location";
}

function addDiagnostics(
  ctx: SchemaGenContext,
  file: tm.SourceFile,
  callExpression: tm.Node,
  callDiagnostics: CallDiagnostics[]
) {
  if (ctx.diagnostics.size) {
    const { line, column } = file.getLineAndColumnAtPos(
      callExpression.getStart()
    );
    callDiagnostics.push({
      diagnostics: ctx.diagnostics,
      line,
      column,
      filePath: file.getFilePath(),
    });
  }
}

function convertEndpointType(
  ctx: ConvertTypeContext,
  callExpression: tm.Node,
  callDiagnostics: CallDiagnostics[],
  diagnosticsFile: tm.SourceFile,
  typeArgument: tm.Node,
  type: tm.Type
): ts.Expression {
  const diagnosticItem = {
    variant: "node",
    node: typeArgument,
  } as const;
  if (
    typeArgument instanceof tm.TypeReferenceNode &&
    typeArgument.getTypeArguments().length === 0
  ) {
    const symbol = typeArgument.getTypeName().getSymbolOrThrow();
    const schema = convertSymbol(ctx, symbol, diagnosticItem, type);
    addDiagnostics(ctx, diagnosticsFile, callExpression, callDiagnostics);
    return schema;
  } else {
    const schema = convertType(ctx, type, diagnosticItem);
    addDiagnostics(ctx, diagnosticsFile, callExpression, callDiagnostics);
    return schema;
  }
}

function convertEndpointCall(
  ctx: ConvertTypeContext,
  call: EndpointTypeInstance,
  file: tm.SourceFile,
  callDiagnostics: CallDiagnostics[]
): ts.Expression {
  const objectProperties = [];
  const requestTypes = [
    ["query", call.query],
    ["path", call.path],
    ["body", call.body],
  ].filter(([_, type]) => type) as [string, NodeType][];
  for (const [name, nodeType] of requestTypes) {
    const schemaExpression = convertEndpointType(
      ctx,
      call.callExpression,
      callDiagnostics,
      file,
      nodeType[0],
      nodeType[1]
    );
    objectProperties.push(
      factory.createPropertyAssignment(name, schemaExpression)
    );
  }

  let schemaExpression;
  if (call.response) {
    schemaExpression = convertEndpointType(
      ctx,
      call.callExpression,
      callDiagnostics,
      file,
      call.response[0],
      call.response[1]
    );
  } else {
    // if no response type is provided, use the default schema z.void() to indicate no response
    schemaExpression = factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("z"),
        "void"
      ),
      [],
      []
    );
  }
  objectProperties.push(
    factory.createPropertyAssignment("response", schemaExpression)
  );
  return factory.createObjectLiteralExpression(objectProperties);
}

function getOrInsert<K, V>(map: Map<K, V>, key: K, create: () => V): V {
  let value = map.get(key);
  if (!value) {
    value = create();
    map.set(key, value);
  }
  return value;
}

function createThunk(expression: ts.Expression): ts.Expression {
  return factory.createArrowFunction(
    undefined,
    undefined,
    [],
    undefined,
    undefined,
    expression
  );
}
