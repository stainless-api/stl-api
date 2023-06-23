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
} from "ts-to-zod/src/convertType.js";

import {
  generateFiles,
  generateImportStatements,
} from "ts-to-zod/src/generateFiles.js";

import { createGenerationConfig } from "ts-to-zod/src/filePathConfig.js";

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
  
  if (process.argv.length < 2) {
    console.log("Need to pass directory");
    process.exit();
  }

  const project = new tm.Project({
    // TODO: should file path be configurable?
    tsConfigFilePath: Path.join(process.argv[1], "tsconfig.json"),
  });

  const typeChecker = project.getTypeChecker();

  const baseCtx = new SchemaGenContext(project);

  const generationOptions = {
    genLocation: {
      type: "node_modules",
      genPath: "ts-to-zod/gen/",
    },
    rootPath,
  } as const;
  const generationConfig = createGenerationConfig(generationOptions);
  const printer = tm.ts.createPrinter();

  for (const file of project.getSourceFiles()) {
    if (file.getFilePath().indexOf("__tests__") < 0) continue;

    const ctx = new ConvertTypeContext(baseCtx, file);
    const imports = new Map<tm.Symbol, ImportInfo>();
    for (const declaration of file.getVariableDeclarations()) {
      const initializer = declaration.getInitializer();
      if (!initializer) continue;
      if (initializer instanceof tm.CallExpression) {
        const receiverExpression = initializer.getExpression();
        const symbol = receiverExpression.getSymbol();
        if (!symbol) continue;
        const functionType = symbol.getTypeAtLocation(file);

        // TODO: check if type is that of the endpoint function from stainless stl
        if (false) continue;
        const typeArguments = functionType.getTypeArguments();
        if (typeArguments.length != 1) continue;
        const [type] = typeArguments;

        const schemaExpression = convertType(ctx, type);

        const typeSymbol = type.getSymbol();
        if (typeSymbol) {
          const declarations = symbol.getDeclarations();
          if (declarations.length) {
            const filePath = declarations[0].getSourceFile().getFilePath();
            // TODO: mangle filePath, add an import for it
          }
        } else {
          const fileInfo = ctx.files.get(file.getFilePath());
          if (fileInfo) {
            fileInfo.imports.forEach((v, k) => imports.set(k, v));
          }
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
        initializer.addArgument(schemaExpression.getText());
      }
    }
    // remove all existing codegen imports
    for (const importDecl of file.getImportDeclarations()) {
      const sourcePath = importDecl.getModuleSpecifier().getLiteralValue();
      if (sourcePath.indexOf("ts-to-zod/gen") == 0) {
        importDecl.remove();
      }
    }

    // add new imports necessary for schema generation
    const importDeclarations = generateImportStatements(
      generationConfig,
      file.getFilePath(),
      imports
    );
    
    const importsString = importDeclarations.map(declaration => printer.printNode(ts.EmitHint.Unspecified, declaration, file.compilerNode)).join();
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
