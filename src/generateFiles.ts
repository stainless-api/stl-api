import { groupBy } from "lodash";
import { SchemaGenContext } from "./convertType";
import { ts } from "ts-morph";
const { factory } = ts;
import * as Path from "path";

const DEFAULT_ALONGSIDE_SUFFIX = "codegen";

type GenLocationOptions =
  | { type: "alongside"; dependencyGenPath: string; suffix?: string }
  | { type: "folder"; genPath: string }
  | { type: "node_modules" };

interface Options {
  genLocation: GenLocationOptions;
  /** 
   * the project root (where package.json resides) from which generation 
   * paths are resolved 
   */
  rootPath: string;
}

export function generateFiles(
  ctx: SchemaGenContext,
  options: Options
): Map<string, ts.SourceFile> {
  let basePath: string;
  let baseDependenciesPath: string;
  let suffix: string | undefined;

  switch (options.genLocation.type) {
    case "alongside":
      basePath = options.rootPath;
      baseDependenciesPath = "";
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
        "path/to/gen/in/TODO"
      );
      baseDependenciesPath = Path.join(basePath, "zod_schema_node_modules");
      break;
  }

  const outputMap = new Map();
  for (const [path, info] of ctx.files.entries()) {
    const generatedPath = generatePath({
      path,
      basePath,
      baseDependenciesPath,
      suffix,
    });

    const statements = [];

    const importGroups = groupBy(
      [...info.imports.entries()],
      ([symbol, { importFromUserFile }]) =>
        relativeImportPath(
          importFromUserFile ? generatedPath : path,
          symbol.getDeclarations()[0].getSourceFile().getFilePath()
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
  path,
  basePath,
  baseDependenciesPath,
  suffix,
}: {
  path: string;
  basePath: string;
  baseDependenciesPath: string;
  suffix?: string;
}): string {
  // if the path is of a file of a dependency
  if (path.match(/node_modules$/) != null) {
    throw new Error("todo: put dependency gen in the appropriate file");
  } else if (suffix) {
    const pathDir = Path.dirname(path);
    let pathName = Path.basename(path);
    // strip extension off of pathName
    const extensionPos = pathName.lastIndexOf(".");
    if (extensionPos >= 0) {
      const extension = pathName.substring(extensionPos);
      pathName = pathName.slice(0, extensionPos) + `.${suffix}` + extension;
    } else {
      pathName = pathName + `.${suffix}`;
    }
    path = Path.join(pathDir, pathName);
  }
  return Path.relative("./", Path.join(basePath, Path.relative("./", path)));
}
