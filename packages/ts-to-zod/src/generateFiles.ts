import { groupBy } from "lodash";
import { ImportInfo, SchemaGenContext } from "./convertType";
import { ts, Symbol } from "ts-morph";
const { factory } = ts;
import * as Path from "path";
import {
  GenOptions,
  GenerationConfig,
  createGenerationConfig,
} from "./filePathConfig";

export function generateFiles(
  ctx: SchemaGenContext,
  options: GenOptions
): Map<string, ts.SourceFile> {
  const outputMap = new Map();
  const generationConfig = createGenerationConfig(options);
  for (const [path, info] of ctx.files.entries()) {
    const generatedPath = generatePath({
      path,
      ...generationConfig,
    });

    const statements: ts.Statement[] = generateImportStatements(
      generationConfig,
      generatedPath,
      options.zPackage,
      info.imports
    );

    for (const schema of info.generatedSchemas) {
      const declaration = factory.createVariableDeclaration(
        schema.symbol.getName(),
        undefined,
        undefined,
        schema.expression
      );
      const variableStatement = factory.createVariableStatement(
        schema.isExported
          ? [factory.createToken(ts.SyntaxKind.ExportKeyword)]
          : [],
        factory.createVariableDeclarationList([declaration], ts.NodeFlags.Const)
      );
      statements.push(variableStatement);
    }
    const sourceFile = factory.createSourceFile(
      statements,
      factory.createToken(ts.SyntaxKind.EndOfFileToken),
      0
    );
    outputMap.set(generatedPath, sourceFile);
  }
  return outputMap;
}

function relativeImportPath(
  importingFile: string,
  importedFile: string
): string {
  let relativePath = Path.relative(Path.dirname(importingFile), importedFile);
  if (!relativePath.startsWith(".")) relativePath = `./${relativePath}`;
  return relativePath;
}

function generatePath({
  /** Path of the file for which the schema is being generated */
  path,
  /** The root path of the project. Usually the root of an npm package. */
  rootPath,
  /** Base path where user file schemas should be generated in */
  basePath,
  /** Base path where dependency file schemas should be generated in */
  baseDependenciesPath,
  /** The suffix to append to file names, if specified */
  suffix,
}: {
  path: string;
  rootPath: string;
  basePath: string;
  baseDependenciesPath: string;
  suffix?: string;
}): string {
  // set cwd to the root path for proper processing of relative paths
  // save old cwd to restore later
  // either basePath or baseDependenciesPath
  let chosenBasePath = basePath;

  if (path.match(/node_modules$/) != null) {
    chosenBasePath = baseDependenciesPath;
  } else if (suffix) {
    const parsedPath = Path.parse(path);
    path = Path.join(
      parsedPath.dir,
      `${parsedPath.name}.${suffix}${parsedPath.ext}`
    );
  }

  return Path.join(chosenBasePath, Path.relative(rootPath, path));
}

export function generateImportStatements(
  config: GenerationConfig,
  filePath: string,
  zPackage: string | undefined,
  imports: Map<Symbol, ImportInfo>
): ts.ImportDeclaration[] {
  const importDeclarations = [];
  const importGroups = groupBy(
    [...imports.entries()],
    ([symbol, { importFromUserFile }]) =>
      relativeImportPath(
        filePath,
        importFromUserFile
          ? symbol.getDeclarations()[0].getSourceFile().getFilePath()
          : generatePath({
              path: symbol.getDeclarations()[0].getSourceFile().getFilePath(),
              ...config,
            })
      )
  );
  const zImportClause = factory.createImportClause(
    false,
    undefined,
    factory.createNamedImports([
      factory.createImportSpecifier(
        false,
        undefined,
        factory.createIdentifier("z")
      ),
    ])
  );
  const zImportDeclaration = factory.createImportDeclaration(
    [],
    zImportClause,
    factory.createStringLiteral(zPackage || "zod")
  );

  importDeclarations.push(zImportDeclaration);

  for (const [relativePath, entries] of Object.entries(importGroups)) {
    const importSpecifiers = entries.map(([symbol, { as }]) => {
      if (as === symbol.getName()) as = undefined;

      return factory.createImportSpecifier(
        false,
        as ? factory.createIdentifier(symbol.getName()) : undefined,
        factory.createIdentifier(as || symbol.getName())
      );
    });
    const importClause = factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports(importSpecifiers)
    );
    const importDeclaration = factory.createImportDeclaration(
      undefined,
      importClause,
      factory.createStringLiteral(relativePath),
      undefined
    );
    importDeclarations.push(importDeclaration);
  }
  return importDeclarations;
}
