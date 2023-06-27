import * as tm from "ts-morph";
import { ts } from "ts-morph";
const { factory } = ts;
import pkgUp from "pkg-up";
import Path from "path";
import fs from "fs";

import { convertType } from "ts-to-zod";
import {
  ConvertTypeContext,
  SchemaGenContext,
  ImportInfo,
  convertSymbol,
} from "ts-to-zod/dist/convertType";

import {
  generateFiles,
  generateImportStatements,
} from "ts-to-zod/dist/generateFiles";

import { createGenerationConfig } from "ts-to-zod/dist/filePathConfig";

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

  const generationOptions = {
    genLocation: {
      type: "node_modules",
      genPath: "stl-api/gen/",
    },
    rootPath,
    zPackage: "stainless",
  } as const;
  const generationConfig = createGenerationConfig(generationOptions);
  const printer = tm.ts.createPrinter();

  for (const file of project.getSourceFiles()) {
    const ctx = new ConvertTypeContext(baseCtx, file);
    const imports = new Map<tm.Symbol, ImportInfo>();
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
      const type = typeArgument.getType();

      let schemaExpression: ts.Expression;

      const typeSymbol = type.getAliasSymbol() || type.getSymbol();
      if (typeSymbol && (type.getAliasSymbol() || type.isInterface())) {
        schemaExpression = convertSymbol(ctx, typeSymbol);
        const declaration = typeSymbol.getDeclarations()[0];
        if (declaration) {
          if (declaration.getSourceFile().getFilePath() === file.getFilePath()) {
            imports.set(typeSymbol, {});
          }
        }
      } else {
        schemaExpression = convertType(ctx, type);
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
      fileInfo.imports.forEach((v, k) => imports.set(k, v));
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
})();
