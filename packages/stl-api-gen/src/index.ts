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
  convertSymbol,
  ErrorAbort,
  Incident,
  Diagnostics,
} from "ts-to-zod/dist/convertType";

import {
  generateFiles,
  generateImportStatements,
} from "ts-to-zod/dist/generateFiles";

import { createGenerationConfig } from "ts-to-zod/dist/filePathConfig";

const NODE_MODULES_GEN_PATH = "stl-api/gen/";

interface MagicCallDiagnostics {
  line: number;
  column: number;
  filePath: string;
  diagnostics: Map<string, Diagnostics>;
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Need to pass directory");
    process.exit();
  }

  const packageJsonPath = await pkgUp({
    cwd: process.argv[2],
  });
  if (!packageJsonPath) throw "todo";
  const rootPath = Path.dirname(packageJsonPath);

  const project = new tm.Project({
    // TODO: should file path be configurable?
    tsConfigFilePath: Path.join(process.argv[2], "tsconfig.json"),
  });

  const baseCtx = new SchemaGenContext(project);

  const callDiagnostics: MagicCallDiagnostics[] = [];

  const generationOptions = {
    genLocation: {
      type: "node_modules",
      genPath: NODE_MODULES_GEN_PATH,
    },
    rootPath,
    zPackage: "stainless",
  } as const;
  const generationConfig = createGenerationConfig(generationOptions);
  const printer = tm.ts.createPrinter();

  for (const file of project.getSourceFiles()) {
    const ctx = new ConvertTypeContext(baseCtx, file);
    const imports = new Map<string, ImportInfo>();
    let hasMagicCall = false;
    // a list of closures to call to modify the file before saving it
    // performs modifications that invalidate ast information after
    // all tree visiting is complete
    const fileOperations: (() => void)[] = [];

    for (const callExpression of file.getDescendantsOfKind(
      ts.SyntaxKind.CallExpression
    )) {
      const receiverExpression = callExpression.getExpression();
      const symbol = receiverExpression.getSymbol();
      if (!symbol) continue;

      const symbolDeclaration = symbol.getDeclarations()[0];
      if (!symbolDeclaration) continue;
      const symbolDeclarationFile = symbolDeclaration
        .getSourceFile()
        .getFilePath();

      if (
        symbol.getEscapedName() !== "magic" ||
        symbolDeclarationFile.indexOf("stl.d.ts") < 0
      ) {
        continue;
      }

      const typeRefArguments = callExpression.getTypeArguments();
      if (typeRefArguments.length != 1) continue;
      hasMagicCall = true;

      const [typeArgument] = typeRefArguments;
      
      let hasTypeArguments = false;
      
      if (typeArgument instanceof tm.TypeReferenceNode) {
        const name = typeArgument.getTypeName();
        if (typeArgument.getTypeArguments().length) hasTypeArguments = true;
        const symbol = name.getSymbolOrThrow();
      } else {
        
      }
      


      const type = typeArgument.getType();
      let schemaExpression: ts.Expression;

      ctx.isRoot = true;
      ctx.diagnostics = new Map();
      if (
        typeArgument instanceof tm.TypeReferenceNode && typeArgument.getTypeArguments().length === 0
      ) {
        const symbol = typeArgument.getTypeName().getSymbolOrThrow();
        try {
          convertSymbol(ctx, symbol, {
            variant: "node",
            node: typeArgument,
          });
        } catch (e) {
          if (e instanceof ErrorAbort) break;
          else throw e;
        } finally {
          addDiagnostics(ctx, file, callExpression, callDiagnostics);
        }
        const name = symbol.getName();
        let as;
        const declaration = symbol.getDeclarations()[0];
        // TODO factor out this logic in ts-to-zod and export a function
        if (type.isEnum()) {
          as = `__enum_${name}`;
        } else if (type.isClass()) {
          as = `__class_${name}`;
        } else {
          as = `__symbol_${name}`;
        }

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
          schemaExpression = convertType(ctx, type, {
            variant: "node",
            node: typeArgument,
          });
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
      callExpression.addArgument(
        printer.printNode(
          ts.EmitHint.Unspecified,
          schemaExpression,
          file.compilerNode
        )
      );
    }
    if (!hasMagicCall) continue;

    // Get the imports needed for the current file, any
    const fileInfo = ctx.files.get(file.getFilePath());
    if (fileInfo) {
      for (const [name, importInfo] of fileInfo.imports) {
        // TODO: is handling multiple declarations relevant here?
        // Don't include imports that would import from the file we're
        // currently processing. This is relevant when handling enums and
        // classes.
        if (importInfo.sourceFile === file.getFilePath()) {
          imports.set(name, {
            ...importInfo,
            sourceFile: Path.join(
              rootPath,
              "node_modules",
              NODE_MODULES_GEN_PATH,
              Path.relative(rootPath, importInfo.sourceFile)
            ),
          });
        } else imports.set(name, importInfo);
      }
    }

    // add new imports necessary for schema generation
    let importDeclarations = generateImportStatements(
      generationConfig,
      file.getFilePath(),
      "stainless",
      imports
    );

    let hasZImport = false;

    // remove all existing codegen imports
    const fileImportDeclarations = file.getImportDeclarations();
    for (const importDecl of fileImportDeclarations) {
      const sourcePath = importDecl.getModuleSpecifier().getLiteralValue();
      if (sourcePath.indexOf("stl-api/gen") == 0) {
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
    file.insertStatements(insertPosition, importsString);

    // Commit all operations potentially destructive to AST visiting.
    fileOperations.forEach((op) => op());
  }

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
      process.exit(0);
    }
  }

  project.save();

  const generatedFileContents = generateFiles(baseCtx, generationOptions);

  for (const [file, fileContents] of generatedFileContents) {
    const fileDir = Path.dirname(file);
    // creates directory where to write file to, if it doesn't already exist
    await fs.promises.mkdir(fileDir, {
      recursive: true,
    });

    // write sourceFile to file
    await fs.promises.writeFile(file, printer.printFile(fileContents));
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
  callDiagnostics: MagicCallDiagnostics[]
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
