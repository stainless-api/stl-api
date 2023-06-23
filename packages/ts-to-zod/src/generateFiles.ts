import { groupBy } from "lodash";
import { SchemaGenContext } from "./convertType";
import { ts } from "ts-morph";
const { factory } = ts;
import * as Path from "path";

const DEFAULT_ALONGSIDE_SUFFIX = "codegen";

export type GenLocationOptions =
  | { type: "alongside"; dependencyGenPath: string; suffix?: string }
  | { type: "folder"; genPath: string }
  | { type: "node_modules"; genPath: string };

export interface GenOptions {
  genLocation: GenLocationOptions;
  /**
   * the project root (where package.json resides) from which generation
   * paths are resolved
   */
  rootPath: string;
}

export function generateFiles(
  ctx: SchemaGenContext,
  options: GenOptions
): Map<string, ts.SourceFile> {
  let basePath: string;
  let baseDependenciesPath: string;
  let suffix: string | undefined;

  switch (options.genLocation.type) {
    case "alongside":
      basePath = options.rootPath;
      baseDependenciesPath = Path.join(
        basePath,
        options.genLocation.dependencyGenPath
      );
      suffix = options.genLocation.suffix || DEFAULT_ALONGSIDE_SUFFIX;
      break;
    case "folder":
      basePath = Path.join(options.rootPath, options.genLocation.genPath);
      baseDependenciesPath = Path.join(basePath, "zod_schema_node_modules");
      break;
    case "node_modules":
      basePath = Path.join(
        options.rootPath,
        "node_modules",
        options.genLocation.genPath
      );
      baseDependenciesPath = Path.join(basePath, "zod_schema_node_modules");
      break;
  }

  const outputMap = new Map();
  for (const [path, info] of ctx.files.entries()) {
    const generatedPath = generatePath({
      path,
      rootPath: options.rootPath,
      basePath,
      baseDependenciesPath,
      suffix,
    });

    const statements = [];

    const importGroups = groupBy(
      [...info.imports.entries()],
      ([symbol, { importFromUserFile }]) =>
        relativeImportPath(
          generatedPath,
          importFromUserFile
            ? symbol.getDeclarations()[0].getSourceFile().getFilePath()
            : generatePath({
                path: symbol.getDeclarations()[0].getSourceFile().getFilePath(),
                rootPath: options.rootPath,
                basePath,
                baseDependenciesPath,
                suffix,
              })
        )
    );

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
      statements.push(importDeclaration);
    }

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
