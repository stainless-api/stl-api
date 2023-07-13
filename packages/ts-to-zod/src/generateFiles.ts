import { Dictionary, groupBy } from "lodash";
import {
  NamespaceImportInfo as NamespaceImportInfo,
  FileInfo,
  ImportInfo,
  SchemaGenContext,
} from "./convertType";
import { ts } from "ts-morph";
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
): Map<string, ts.Statement[]> {
  const outputMap = new Map();
  const generationConfig = createGenerationConfig(options);
  for (const [path, info] of ctx.files.entries()) {
    const generatedPath = generatePath(path, generationConfig);

    const tsPath = `${generatedPath}.ts`;
    const dtsPath = `${generatedPath}.d.ts`;
    const cjsPath = `${generatedPath}.js`;

    // TODO: clean up by removing duplicate functions, rename function
    outputMap.set(
      tsPath,
      generateStatementsTS(info, generationConfig, generatedPath, options)
    );
    // outputMap.set(
    //   dtsPath,
    //   generateStatementsDTS(info, generationConfig, generatedPath, options)
    // );
    // outputMap.set(
    //   cjsPath,
    //   generateStatementsCJS(info, generationConfig, generatedPath, options)
    // );
  }
  return outputMap;
}

function generateStatementsTS(
  info: FileInfo,
  generationConfig: GenerationConfig,
  generatedPath: string,
  options: GenOptions
): ts.Statement[] {
  const statements: ts.Statement[] = generateImportStatementsESM(
    generationConfig,
    generatedPath,
    options.zPackage,
    info.imports,
    info.namespaceImports
  );

  for (const schema of info.generatedSchemas.values()) {
    const declaration = factory.createVariableDeclaration(
      schema.name,
      undefined,
      schema.type || factory.createTypeReferenceNode("z.ZodTypeAny"),
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
  return statements;
}

function generateStatementsDTS(
  info: FileInfo,
  generationConfig: GenerationConfig,
  generatedPath: string,
  options: GenOptions
): ts.Statement[] {
  const statements: ts.Statement[] = generateImportStatementsESM(
    generationConfig,
    generatedPath,
    options.zPackage,
    info.imports,
    info.namespaceImports
  );

  for (const schema of info.generatedSchemas.values()) {
    if (schema.private) continue;
    const declaration = factory.createVariableDeclaration(
      schema.name,
      undefined,
      schema.type || factory.createTypeReferenceNode("z.ZodTypeAny")
    );
    const variableStatement = factory.createVariableStatement(
      schema.isExported
        ? [factory.createToken(ts.SyntaxKind.ExportKeyword)]
        : [],
      factory.createVariableDeclarationList([declaration], ts.NodeFlags.Const)
    );
    statements.push(variableStatement);
  }
  return statements;
}

function generateStatementsCJS(
  info: FileInfo,
  generationConfig: GenerationConfig,
  generatedPath: string,
  options: GenOptions
): ts.Statement[] {
  const statements: ts.Statement[] = generateImportStatementsCJS(
    generationConfig,
    generatedPath,
    options.zPackage,
    info.imports,
    info.namespaceImports
  );

  for (const schema of info.generatedSchemas.values()) {
    const declaration = factory.createVariableDeclaration(
      schema.name,
      undefined,
      undefined,
      schema.expression
    );
    const variableStatement = factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList([declaration], ts.NodeFlags.Const)
    );
    statements.push(variableStatement);
    if (schema.isExported) {
      const exportTarget = factory.createPropertyAccessExpression(
        factory.createIdentifier("exports"),
        schema.name
      );
      statements.push(
        factory.createExpressionStatement(
          factory.createAssignment(
            exportTarget,
            factory.createIdentifier(schema.name)
          )
        )
      );
    }
  }
  return statements;
}

export function relativeImportPath(
  importingFile: string,
  importedFile: string
): string {
  let relativePath = Path.relative(Path.dirname(importingFile), importedFile);
  if (!relativePath.startsWith(".")) relativePath = `./${relativePath}`;
  return relativePath;
}

/** Returns the path in which to generate schemas for an input path. Generates without a file extension. */
export function generatePath(
  path: string,
  { basePath, baseDependenciesPath, rootPath, suffix }: GenerationConfig
): string {
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

  const pathWithExtension = Path.join(
    chosenBasePath,
    Path.relative(rootPath, path)
  );
  const parsed = Path.parse(pathWithExtension);
  return Path.join(parsed.dir, parsed.name);
}

function generateImportGroups(
  imports: Map<string, ImportInfo>,
  filePath: string,
  config: GenerationConfig
): Dictionary<[string, ImportInfo][]> {
  return groupBy(
    [...imports.entries()],
    ([_, { importFromUserFile, sourceFile }]) =>
      relativeImportPath(
        filePath,
        importFromUserFile ? sourceFile : generatePath(sourceFile, config)
      )
  );
}

function normalizeImport(relativePath: string): string {
  // use absolute, not relative, imports for things in node_modules
  const nodeModulesPos = relativePath.lastIndexOf("node_modules");
  if (nodeModulesPos >= 0) {
    relativePath = relativePath.substring(nodeModulesPos + 13);
  }

  // strip extension like '.ts' off file
  const parsedRelativePath = Path.parse(relativePath);
  let extensionlessRelativePath = Path.join(
    parsedRelativePath.dir,
    parsedRelativePath.name
  );
  if (extensionlessRelativePath[0] !== "." && nodeModulesPos < 0) {
    extensionlessRelativePath = `./${extensionlessRelativePath}`;
  }
  return extensionlessRelativePath;
}

export function generateImportStatementsESM(
  config: GenerationConfig,
  filePath: string,
  zPackage: string | undefined,
  imports: Map<string, ImportInfo>,
  namespaceImports: Map<string, NamespaceImportInfo>
): ts.ImportDeclaration[] {
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

  const importDeclarations = [zImportDeclaration];

  const importGroups = generateImportGroups(imports, filePath, config);

  for (let [relativePath, entries] of Object.entries(importGroups)) {
    const importSpecifiers = entries.map(([name, { as }]) => {
      if (as === name) as = undefined;

      return factory.createImportSpecifier(
        false,
        as ? factory.createIdentifier(name) : undefined,
        factory.createIdentifier(as || name)
      );
    });
    const importClause = factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports(importSpecifiers)
    );

    const normalizedImport = normalizeImport(relativePath);

    const importDeclaration = factory.createImportDeclaration(
      undefined,
      importClause,
      factory.createStringLiteral(normalizedImport),
      undefined
    );
    importDeclarations.push(importDeclaration);
  }

  for (const [name, info] of namespaceImports.entries()) {
    const relativeImport = relativeImportPath(
      filePath,
      info.importFromUserFile
        ? info.sourceFile
        : generatePath(info.sourceFile, config)
    );
    const normalizedImport = normalizeImport(relativeImport);

    const importClause = factory.createImportClause(
      false,
      undefined,
      factory.createNamespaceImport(factory.createIdentifier(name))
    );
    const importDeclaration = factory.createImportDeclaration(
      undefined,
      importClause,
      factory.createStringLiteral(normalizedImport)
    );
    importDeclarations.push(importDeclaration);
  }

  return importDeclarations;
}

export function generateImportStatementsCJS(
  config: GenerationConfig,
  filePath: string,
  zPackage: string | undefined,
  imports: Map<string, ImportInfo>,
  namespaceImports: Map<string, NamespaceImportInfo>
): ts.Statement[] {
  const zRequireExpression = factory.createCallExpression(
    factory.createIdentifier("require"),
    undefined,
    [factory.createStringLiteral(zPackage || "zod")]
  );
  const zImportStatement = factory.createVariableStatement(
    [],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createObjectBindingPattern([
            factory.createBindingElement(undefined, undefined, "z"),
          ]),
          undefined,
          undefined,
          zRequireExpression
        ),
      ],
      ts.NodeFlags.Const
    )
  );

  const importStatements: ts.Statement[] = [zImportStatement];

  const importGroups = generateImportGroups(imports, filePath, config);

  for (let [relativePath, entries] of Object.entries(importGroups)) {
    const bindingElements = entries.map(([name, { as }]) => {
      if (as === name) as = undefined;

      return factory.createBindingElement(
        undefined,
        as ? factory.createIdentifier(name) : undefined,
        factory.createIdentifier(as || name)
      );
    });
    const requireDestructure =
      factory.createObjectBindingPattern(bindingElements);

    const normalizedImport = normalizeImport(relativePath);
    const requireExpression = factory.createCallExpression(
      factory.createIdentifier("require"),
      undefined,
      [factory.createStringLiteral(normalizedImport)]
    );

    const importStatement = factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            requireDestructure,
            undefined,
            undefined,
            requireExpression
          ),
        ],
        ts.NodeFlags.Const
      )
    );
    importStatements.push(importStatement);
  }

  for (const [name, info] of namespaceImports.entries()) {
    const sourceFile = relativeImportPath(
      filePath,
      info.importFromUserFile
        ? info.sourceFile
        : generatePath(info.sourceFile, config)
    );
    const requireExpression = factory.createCallExpression(
      factory.createIdentifier("require"),
      undefined,
      [factory.createStringLiteral(sourceFile)]
    );
    const importStatement = factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            name,
            undefined,
            undefined,
            requireExpression
          ),
        ],
        ts.NodeFlags.Const
      )
    );
    importStatements.push(importStatement);
  }
  return importStatements;
}
