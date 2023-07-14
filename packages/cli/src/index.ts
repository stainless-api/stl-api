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
  convertTypeof,
} from "ts-to-zod/dist/convertType";

import {
  generateFiles,
  generateImportStatements,
  generatePath,
  relativeImportPath,
} from "ts-to-zod/dist/generateFiles";

import {
  GenOptions,
  createGenerationConfig,
} from "ts-to-zod/dist/filePathConfig";

import { Watcher } from "./watch";
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

// TODO: add dry run functionality?
argParser.option("-w, --watch", "enables watch mode");
argParser
  .option(
    "-d, --directory <path>",
    "the directory to generate schemas for",
    "."
  )
  .allowExcessArguments(false);

const FOLDER_GEN_PATH = "stl-api-gen";

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

  let watcher: Watcher | undefined;
  if (options.watch) {
    watcher = new Watcher(rootPath);
  }

  const project =
    watcher?.project ||
    new tm.Project({
      // TODO: should file path be configurable?
      tsConfigFilePath,
    });

  const baseCtx = new SchemaGenContext(project);

  const generationOptions = {
    genLocation: {
      type: "folder",
      genPath: FOLDER_GEN_PATH,
    },
    rootPath,
    zPackage: "stainless",
  } as const;

  const printer = tm.ts.createPrinter();

  const succeeded = await evaluate(
    project,
    baseCtx,
    generationOptions,
    rootPath,
    printer
  );

  if (watcher) {
    for await (const { path } of watcher.getEvents()) {
      console.clear();
      const relativePath = Path.relative(".", path);
      console.log(`Found change in ${relativePath}.`);
      const succeeded = await evaluate(
        watcher.project,
        watcher.baseCtx,
        generationOptions,
        rootPath,
        printer
      );
      if (succeeded) {
        console.clear();
        console.log(`Successfully processed ${relativePath}.`);
      }
      console.log("Watching for file changes...");
    }
  } else if (!succeeded) {
    process.exit(1);
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
  generationOptions: GenOptions,
  rootPath: string,
  printer: ts.Printer
): Promise<boolean> {
  const generationConfig = createGenerationConfig(generationOptions);

  // accumulated diagnostics to emit
  const callDiagnostics: CallDiagnostics[] = [];
  // every stl.types.endpoint call found per file
  const endpointCalls: Map<tm.SourceFile, EndpointCall[]> = new Map();

  // a list of closures to call to modify the file before saving it
  // performs modifications that invalidate ast information after
  // all tree visiting is complete
  const fileOperations: (() => void)[] = [];

  for (const file of project.getSourceFiles()) {
    const ctx = new ConvertTypeContext(baseCtx, file);
    const imports = new Map<string, ImportInfo>();
    const namespacedImports = new Map<string, NamespaceImportInfo>();
    let hasMagicCall = false;

    for (const callExpression of file.getDescendantsOfKind(
      ts.SyntaxKind.CallExpression
    )) {
      const receiverExpression = callExpression.getExpression();
      const symbol = receiverExpression.getSymbol();
      if (!symbol || !isSymbolStlMethod(symbol)) continue;

      const methodName = symbol.getEscapedName();

      if (!(methodName === "magic" || methodName === "endpoint")) continue;

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
        if (!endpointSchema) {
          break;
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

      // Handle stl.magic call

      const typeRefArguments = callExpression.getTypeArguments();
      if (typeRefArguments.length != 1) continue;
      hasMagicCall = true;

      const [typeArgument] = typeRefArguments;

      const type = typeArgument.getType();
      let schemaExpression: ts.Expression;

      ctx.isRoot = true;
      ctx.diagnostics = new Map();

      const diagnosticItem = {
        variant: "node",
        node: typeArgument,
      } as const;

      let typeofSchema;

      try {
        typeofSchema = convertTypeof(ctx, typeArgument, type, diagnosticItem);
      } catch (e) {
        if (e instanceof ErrorAbort) {
          break;
        } else throw e;
      } finally {
        addDiagnostics(ctx, file, callExpression, callDiagnostics);
      }

      if (typeofSchema) {
        schemaExpression = typeofSchema;
      } else if (
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
        const as = mangleTypeName(type, name);
        const declarationFilePath = declaration.getSourceFile().getFilePath();

        if (declarationFilePath === file.getFilePath()) {
          imports.set(symbol.getName(), {
            as,
            sourceFile: declarationFilePath,
          });
        }
        const schemaName = as || name;
        schemaExpression = factory.createIdentifier(schemaName);
      } else {
        try {
          schemaExpression = convertType(ctx, type, diagnosticItem);
        } catch (e) {
          if (e instanceof ErrorAbort) break;
          else throw e;
        } finally {
          addDiagnostics(ctx, file, callExpression, callDiagnostics);
        }
      }

      // remove all arguments to magic function
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
    if (!hasMagicCall) continue;

    // Get the imports needed for the current file, any
    const fileInfo = ctx.files.get(file.getFilePath());
    if (fileInfo) {
      for (const [name, importInfo] of fileInfo.imports) {
        // Don't include imports that would import from the file we're
        // currently processing. This is relevant when handling enums and
        // classes.
        // TODO: is handling multiple declarations relevant here?
        if (!importInfo.importFromUserFile) {
          if (importInfo.sourceFile === file.getFilePath()) {
            imports.set(name, {
              ...importInfo,
              sourceFile: Path.join(
                rootPath,
                FOLDER_GEN_PATH,
                Path.relative(rootPath, importInfo.sourceFile)
              ),
            });
          } else imports.set(name, importInfo);
        }
      }
    }

    // add new imports necessary for schema generation
    let importDeclarations = generateImportStatements(
      generationConfig,
      file.getFilePath(),
      "stainless",
      imports,
      namespacedImports
    );

    let hasZImport = false;

    // remove all existing codegen imports
    const fileImportDeclarations = file.getImportDeclarations();
    for (const importDecl of fileImportDeclarations) {
      const sourcePath = importDecl.getModuleSpecifier().getLiteralValue();
      if (sourcePath.indexOf(FOLDER_GEN_PATH) >= 0) {
        fileOperations.push(() => importDecl.remove());
      } else if (sourcePath === "stainless") {
        for (const specifier of importDecl.getNamedImports()) {
          if (specifier.getName() === "z") {
            hasZImport = true;
          }
        }
      }
    }

    // don't import "z" if it's already imported in the file
    if (hasZImport) {
      importDeclarations = importDeclarations.slice(1);
    }

    const importsString = importDeclarations
      .map((declaration) =>
        printer.printNode(
          ts.EmitHint.Unspecified,
          declaration,
          file.compilerNode
        )
      )
      .join("\n");

    // Insert imports after the last import already in the file.
    const insertPosition = fileImportDeclarations.length;
    fileOperations.push(() =>
      file.insertStatements(insertPosition, importsString)
    );
  }

  // Commit all operations potentially destructive to AST visiting.
  fileOperations.forEach((op) => op());

  const generatedFileContents = generateFiles(baseCtx, generationOptions);

  if (callDiagnostics.length) {
    const output = [];
    let errorCount = 0;
    let warningCount = 0;

    for (const { filePath, line, column, diagnostics } of callDiagnostics) {
      output.push(
        chalk.magenta(
          `While processing magic call at ${Path.relative(
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

  // Generate index.ts
  if (endpointCalls.size) {
    const mapEntries = [];

    const genPath = Path.join(rootPath, FOLDER_GEN_PATH);
    const endpointMapGenPath = Path.join(genPath, "index.ts");

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
              )}`
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

    await fs.promises.mkdir(genPath, { recursive: true });

    await fs.promises.writeFile(
      endpointMapGenPath,
      printer.printFile(mapSourceFile)
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
    await fs.promises.writeFile(file, printer.printFile(sourceFile));
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
  const typeofSchema = convertTypeof(ctx, typeArgument, type, diagnosticItem);
  if (typeofSchema) return typeofSchema;

  if (
    typeArgument instanceof tm.TypeReferenceNode &&
    typeArgument.getTypeArguments().length === 0
  ) {
    const symbol = typeArgument.getTypeName().getSymbolOrThrow();
    const schema = convertSymbol(ctx, symbol, diagnosticItem);
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

// TODO: factor out to ts-to-zod?
function mangleTypeName(type: tm.Type, name: string): string {
  if (type.isEnum()) {
    return `__enum_${name}`;
  } else if (type.isClass()) {
    return `__class_${name}`;
  } else {
    return `__symbol_${name}`;
  }
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
