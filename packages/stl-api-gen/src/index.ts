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

interface EndpointEntry {
  filePath: string;
  identifier: string;
  mangledIdentifier: string;
  path?: ts.Expression;
  query?: ts.Expression;
  body?: ts.Expression;
  response?: ts.Expression;
}

function getOrInsert<K, V>(map: Map<K, V>, key: K, insert: V): V {
  if (!map.has(key)) map.set(key, insert);
  return map.get(key)!;
}

async function main() {
  const packageJsonPath = await pkgUp();
  if (!packageJsonPath) throw "todo";
  const rootPath = Path.dirname(packageJsonPath);

  if (process.argv.length < 3) {
    console.log("Need to pass directory");
    process.exit();
  }

  const project = new tm.Project({
    // TODO: should file path be configurable?
    tsConfigFilePath: Path.join(process.argv[2], "tsconfig.json"),
  });

  const typeChecker = project.getTypeChecker();

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
    for (const declaration of file.getVariableDeclarations()) {
      const initializer = declaration.getInitializer();
      if (!initializer) continue;
      if (initializer instanceof tm.CallExpression) {
        const receiverExpression = initializer.getExpression();
        const symbol = receiverExpression.getSymbol();
        if (!symbol) continue;

        const symbolDeclaration = symbol.getDeclarations()[0];
        const symbolDeclarationFile = symbolDeclaration
          ?.getSourceFile()
          ?.getFilePath();

        // TODO: check if type is that of the endpoint function from stainless stl
        if (
          symbol.getEscapedName() !== "magic" ||
          symbolDeclarationFile?.indexOf("stl.d.ts") < 0
        )
          continue;
        const typeRefArguments = initializer.getTypeArguments();
        if (typeRefArguments.length != 1) continue;
        hasMagicCall = true;

        const typeArguments = typeRefArguments.map((typeRef) =>
          typeRef.getType()
        );
        const [type] = typeArguments;

        let schemaExpression;

        const typeSymbol = type.getSymbol();
        if (typeSymbol && (type.getAliasSymbol() || type.isInterface())) {
          schemaExpression = convertSymbol(ctx, typeSymbol);
          const declarations = symbol.getDeclarations();
          if (declarations.length) {
            const filePath = declarations[0].getSourceFile().getFilePath();
            // TODO: mangle filePath, add an import for it
          }
        } else {
          schemaExpression = convertType(ctx, type);
        }

        // remove all arguments to magic function
        for (
          let argumentLength = initializer.getArguments().length;
          argumentLength > 0;
          argumentLength--
        ) {
          initializer.removeArgument(argumentLength - 1);
        }

        // fill in generated schema expression
        initializer.addArgument(
          printer.printNode(
            ts.EmitHint.Unspecified,
            schemaExpression,
            file.compilerNode
          )
        );
      }
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
    for (const importDecl of file.getImportDeclarations()) {
      const sourcePath = importDecl.getModuleSpecifier().getLiteralValue();
      if (sourcePath.indexOf("stl-api/gen") == 0) {
        importDecl.remove();
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
    file.addStatements(importsString);
  }

  // save all of the changes made to the stl.magic calls
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

function getSchemaType(
  node: tm.Node,
  args: tm.Type,
  fieldName: string
): tm.Type | undefined {
  return args.getProperty(fieldName)?.getTypeAtLocation(node);
}

function processSchemaType(
  ctx: ConvertTypeContext,
  type: tm.Type | undefined,
  imports: Set<tm.Symbol>
): ts.Expression | undefined {
  if (!type) return undefined;
  const expression = convertType(ctx, type);
  const symbol = type.getSymbol();
  if (symbol) imports.add(symbol);
  return expression;
}

function mangledSymbolName(symbol: tm.Symbol): string {
  const name = symbol.getName();
  const filePath = symbol.getDeclarations()[0].getSourceFile().getFilePath();

  const unicodeLetterRegex = /\p{L}/u;

  const escapedStringBuilder = [];
  for (const codePointString of filePath) {
    if (codePointString === "/") {
      escapedStringBuilder.push("$");
    } else if (unicodeLetterRegex.test(codePointString)) {
      escapedStringBuilder.push(codePointString);
    } else {
      escapedStringBuilder.push(`u${codePointString.codePointAt(0)}`);
    }
  }

  return `__stlapigen_${name}_${escapedStringBuilder.join()}`;
}

function setEndpointProperty(
  endpoint: EndpointEntry,
  property: "body" | "query" | "path" | "response",
  statements: ts.Statement[]
) {
  const schemaExpression = endpoint[property];
  if (!schemaExpression) return;
  const assignment = factory.createAssignment(
    factory.createPropertyAccessExpression(
      factory.createIdentifier(endpoint.mangledIdentifier),
      factory.createIdentifier(property)
    ),
    schemaExpression
  );
  statements.push(factory.createExpressionStatement(assignment));
}
