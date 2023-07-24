import { ts } from "ts-morph";
const { factory } = ts;
import * as tm from "ts-morph";
import { groupBy } from "lodash";
import Path from "path";
import {
  arraySetSchemaProperties,
  bigIntSchemaProperties,
  dateSchemaProperties,
  numberSchemaProperties,
  objectSchemaProperties,
  stringSchemaProperties,
} from "./typeSchemaUtils";

export interface Diagnostics {
  errors: Incident[];
  warnings: Incident[];
}

interface Position {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface Incident {
  message: string;
  position?: Position;
  name?: string;
  typeText?: string;
  propertyName?: string;
}

export type DiagnosticItem =
  | {
      variant: "node";
      node: tm.Node;
    }
  | { variant: "type"; type: tm.Type }
  | {
      variant: "property";
      name: string;
      symbol: tm.Symbol;
      enclosingType: tm.Type;
    };

export class ErrorAbort extends Error {}

export class SchemaGenContext {
  constructor(
    public project: tm.Project,
    public typeChecker = project.getTypeChecker(),
    public files: Map<string, FileInfo> = new Map(),
    public symbols: Set<tm.Symbol> = new Set(),
    /* map from file names to any diagnostics associated with them */
    public diagnostics: Map<string, Diagnostics> = new Map(),
    public generateInUserFile?: boolean
  ) {}

  getFileInfo(filePath: string): FileInfo {
    return mapGetOrCreate(this.files, filePath, () => ({
      imports: new Map(),
      namespaceImports: new Map(),
      generatedSchemas: new Map(),
      /**
       * Maps a module path to an identifier, valid within the file, to
       * refer to it. These identifiers are created as placeholders, and
       * are later updated with disambiguated module names. As such, using
       * the exact identifier values within the AST, rather than copies of
       * them, is crucial.
       */
      moduleIdentifiers: {
        userModules: new Map(),
        generatedModules: new Map(),
      },
    }));
  }

  /** Returns the filePath corresponding to the location of the incident, and adds
   * location information to the given incident if relevant.
   */
  private processIncident(
    item: DiagnosticItem,
    incident: Incident
  ): { filePath: string } {
    let filePath = "unknown";
    switch (item.variant) {
      case "node":
        const sourceFile = item.node.getSourceFile();
        filePath = sourceFile.getFilePath();
        const { line: startLine, column: startColumn } =
          sourceFile.getLineAndColumnAtPos(item.node.getStart());
        const { line: endLine, column: endColumn } =
          sourceFile.getLineAndColumnAtPos(item.node.getStart());
        incident.position ||= {
          startLine,
          startColumn,
          endLine,
          endColumn,
        };
        break;
      case "type": {
        incident.typeText ||= item.type.getText();
        const symbol = item.type.getAliasSymbol() || item.type.getSymbol();
        if (!symbol) return { filePath: "<unknown file>" };
        const declaration = getDeclaration(symbol);
        if (!declaration) return { filePath: "<unknown file>" };
        const { filePath: typeFilePath } = this.processIncident(
          { variant: "node", node: declaration },
          incident
        );
        filePath = typeFilePath;
        incident.name ||= symbol.getName();
        break;
      }
      case "property": {
        incident.propertyName ||= item.name;
        for (const declaration of item.symbol.getDeclarations()) {
          if (
            declaration instanceof tm.PropertyDeclaration ||
            declaration instanceof tm.PropertySignature
          ) {
            this.processIncident(
              { variant: "node", node: declaration },
              incident
            );
            break;
          }
        }
        return this.processIncident(
          { variant: "type", type: item.enclosingType },
          incident
        );
      }
    }
    return { filePath };
  }

  addError(item: DiagnosticItem, incident: Incident, abort: true): never;
  addError(item: DiagnosticItem, incident: Incident, abort?: boolean): void;
  addError(item: DiagnosticItem, incident: Incident, abort?: boolean) {
    const { filePath } = this.processIncident(item, incident);
    const incidents = mapGetOrCreate(this.diagnostics, filePath, () => ({
      errors: [],
      warnings: [],
    }));

    incidents.errors.push(incident);
    if (abort) throw new ErrorAbort();
  }

  addWarning(item: DiagnosticItem, incident: Incident) {
    const { filePath } = this.processIncident(item, incident);
    const incidents = mapGetOrCreate(this.diagnostics, filePath, () => ({
      errors: [],
      warnings: [],
    }));
    incidents.warnings.push(incident);
  }
}

export class ConvertTypeContext extends SchemaGenContext {
  constructor(ctx: SchemaGenContext, public node: tm.Node) {
    super(
      ctx.project,
      ctx.typeChecker,
      ctx.files,
      ctx.symbols,
      ctx.diagnostics
    );
    this.isRoot = true;
    this.currentFilePath = this.node.getSourceFile().getFilePath();
  }

  isRoot: boolean;
  currentFilePath: string;

  isSymbolImported(symbol: tm.Symbol): boolean {
    const declaration = getDeclarationOrThrow(symbol);
    const symbolFileName: string = declaration.getSourceFile().getFilePath();
    return (
      this.currentFilePath !== symbolFileName ||
      isDeclarationImported(declaration)
    );
  }
}

function isDeclarationImported(declaration: tm.Node): boolean {
  return (
    declaration instanceof tm.ImportSpecifier ||
    declaration instanceof tm.ImportClause ||
    declaration instanceof tm.ImportDeclaration
  );
}

export interface ImportInfo {
  sourceFile: string;
  as?: string;
  /**
   * If true, the output code will import from
   * the original file associated with the import's symbol; otherwise
   * it will import from the generated file associated with
   * `symbol`.
   */
  importFromUserFile?: boolean;
  /** Whether this import shouldn't be imported into a user file when using `stl.magic`. */
  excludeFromUserFile?: boolean;
}

export interface NamespaceImportInfo {
  importFromUserFile?: boolean;
  sourceFile: string;
}

export interface FileInfo {
  imports: Map<string, ImportInfo>;
  /** imports all the contents from the module with the given file path */
  namespaceImports: Map<string, NamespaceImportInfo>;
  generatedSchemas: Map<string, GeneratedSchema>;
  moduleIdentifiers: {
    userModules: Map<string, ts.Identifier>;
    generatedModules: Map<string, ts.Identifier>;
  };
  /** maps imported type id to local identifier it's imported as */
  importTypeNameMap?: Map<number, string>;
}

function buildImportTypeMap(sourceFile: tm.SourceFile): Map<number, string> {
  const outputMap = new Map();
  for (const decl of sourceFile.getImportDeclarations()) {
    for (const specifier of decl.getNamedImports()) {
      const id = getTypeId(specifier.getType());
      const identifier =
        specifier.compilerNode.name?.text ||
        specifier.compilerNode.propertyName?.text;
      outputMap.set(id, identifier);
    }
  }
  return outputMap;
}

function getModuleIdentifier(
  fileInfo: FileInfo,
  modulePath: string,
  importFromUserFile: boolean | undefined
): ts.Identifier {
  const moduleIdentifiers = fileInfo.moduleIdentifiers;
  return mapGetOrCreate(
    importFromUserFile
      ? moduleIdentifiers.userModules
      : moduleIdentifiers.generatedModules,
    modulePath,
    () => factory.createIdentifier("modulePlaceholder")
  );
}

export function processModuleIdentifiers(fileInfo: FileInfo) {
  impl(fileInfo.moduleIdentifiers.generatedModules);
  impl(fileInfo.moduleIdentifiers.userModules);
  function impl(map: Map<string, ts.Identifier>) {
    const disambiguateGroups = groupBy([...map.entries()], ([path, _]) => {
      const fileName = Path.parse(path).name;
      const matches = fileName.match(/[\p{L}0-9-.]/gu);
      if (!matches || !matches.length) return "__module";
      const identifierBuilder = [];

      for (const match of matches) {
        if (match === "-" || match === ".") identifierBuilder.push("_");
        else if (match >= "0" && match <= "9")
          identifierBuilder.push("_", match);
        else identifierBuilder.push(match);
      }

      const identifier = identifierBuilder.join("");

      return fileInfo.generatedSchemas.has(identifier)
        ? `__module_${identifier}`
        : identifier;
    });

    for (const [key, group] of Object.entries(disambiguateGroups)) {
      if (group.length === 1) {
        Object.assign(group[0][1], factory.createIdentifier(key));
      } else {
        for (let i = 0; i < group.length; i++) {
          Object.assign(group[i][1], factory.createIdentifier(`${key}__${i}`));
        }
      }
    }
  }
}

function prefixValueWithModule(
  ctx: SchemaGenContext,
  name: string,
  currentFilePath: string,
  valueFilePath: string,
  importFromUserFile: boolean,
  escapedName?: string
): ts.Expression {
  const currentFileInfo = ctx.getFileInfo(currentFilePath);
  return ctx.generateInUserFile ||
    (!importFromUserFile && currentFilePath === valueFilePath)
    ? factory.createIdentifier(escapedName || name)
    : factory.createPropertyAccessExpression(
        getModuleIdentifier(currentFileInfo, valueFilePath, importFromUserFile),
        name
      );
}

interface GeneratedSchema {
  name: string;
  expression: ts.Expression;
  isExported: boolean;
  /**
   * The type for the schema value to generate in d.ts.
   * Defaults to `z.ZodTypeAny`.
   */
  type?: ts.TypeNode;
  /** Whether the type shouldn't be exported from the definition file. Defaults to false. */
  private?: boolean;
}

export function convertSymbol(
  ctx: SchemaGenContext,
  symbol: tm.Symbol,
  diagnosticItem: DiagnosticItem,
  /** use the type for schema generation instead of attempting to resolve it */
  ty?: tm.Type
) {
  let isRoot = false;

  const declaration = getDeclaration(symbol);
  if (!declaration) {
    ctx.addError(
      diagnosticItem,
      { message: `Could not find type of name \`${symbol.getName()}\`` },
      true
    );
  }
  let currentFilePath: string = declaration.getSourceFile().getFilePath();
  const internalCtx = new ConvertTypeContext(ctx, declaration);
  const type = ty || declaration.getType();

  const fileName = getDeclarationDefinitionPath(declaration);
  internalCtx.currentFilePath = fileName;

  let as;

  if (ctx instanceof ConvertTypeContext) {
    isRoot = ctx.isRoot;
    currentFilePath = ctx.currentFilePath;
    if (ctx.isSymbolImported(symbol) || type.isEnum() || type.isClass()) {
      const fileInfo = ctx.getFileInfo(ctx.currentFilePath);
      const importTypeNameMap = (fileInfo.importTypeNameMap ||=
        buildImportTypeMap(ctx.node.getSourceFile()));
      const importAs = importTypeNameMap.get(
        getTypeId(symbol.getTypeAtLocation(ctx.node))
      );

      as = `${importAs || symbol.getName()}Schema`;

      fileInfo.imports.set(symbol.getName(), {
        // TODO: fix name collisions
        as,
        sourceFile: fileName,
      });
    }
  }
  if (!ctx.symbols.has(symbol)) {
    ctx.symbols.add(symbol);

    const generated = convertType(internalCtx, type, diagnosticItem);
    const generatedSchema = {
      name: symbol.getName(),
      expression: generated,
      isExported: isRoot || isDeclarationExported(declaration),
    };

    ctx
      .getFileInfo(fileName)
      .generatedSchemas.set(symbol.getName(), generatedSchema);
  }

  return lazy(
    prefixValueWithModule(
      ctx,
      symbol.getName(),
      currentFilePath,
      fileName,
      false,
      as
    )
  );
}

function getDeclarationDefinitionPath(declaration: tm.Node): string {
  if (declaration instanceof tm.ImportSpecifier) {
    return getDeclarationDefinitionPath(declaration.getImportDeclaration());
  }
  if (declaration instanceof tm.ImportClause) {
    return getDeclarationDefinitionPath(declaration.getParent());
  } else if (declaration instanceof tm.ImportDeclaration) {
    return declaration.getModuleSpecifierSourceFileOrThrow().getFilePath();
  } else return declaration.getSourceFile().getFilePath();
}

function baseIdentifier(entityName: tm.EntityName): tm.Identifier {
  if (entityName instanceof tm.Identifier) return entityName;
  else return baseIdentifier(entityName.getLeft());
}

/**
 * Converts an EntityName to an expression. Optionally accepts an identifier:
 * if provided, `entityName` is converted such that its base identifier is
 * converted to a property access on the given `baseIdentifier`. This is
 * useful for implementing whole module imports.
 */
function convertEntityNameToExpression(
  entityName: tm.EntityName,
  baseIdentifier?: ts.Identifier
): ts.Expression {
  if (entityName instanceof tm.Identifier) {
    if (baseIdentifier) {
      return factory.createPropertyAccessExpression(
        baseIdentifier,
        entityName.getText()
      );
    }
    return entityName.compilerNode;
  } else
    return factory.createPropertyAccessExpression(
      convertEntityNameToExpression(entityName.getLeft(), baseIdentifier),
      entityName.getRight().compilerNode
    );
}

export function convertType(
  ctx: ConvertTypeContext,
  ty: tm.Type,
  diagnosticItem: DiagnosticItem,
  /**
   * If true, forces generation for the current type instead of using `z.lazy()`.
   */
  generateInline?: boolean
): ts.Expression {
  const typeSymbol = ty.getSymbol();

  const baseTypeName = getBaseTypeName(ty);
  let packageTypeName = undefined;
  if (typeSymbol) {
    packageTypeName = typeSymbol.getName();
  }

  switch (baseTypeName) {
    case "Transform": {
      const symbol = ty.getSymbolOrThrow(
        `failed to get symbol for transform: ${ty.getText()}`
      );
      const inputType = ty.getProperty("input")?.getTypeAtLocation(ctx.node);

      if (!inputType)
        throw new Error(
          "Encountered Transform class without required input property"
        );

      const currentFileInfo = ctx.getFileInfo(ctx.currentFilePath);

      const typeFilePath = getTypeFilePath(ty)!;

      // import the transform class
      currentFileInfo.imports.set(symbol.getName(), {
        importFromUserFile: true,
        sourceFile: typeFilePath,
      });

      return methodCall(
        convertType(ctx, inputType, diagnosticItem),
        "transform",
        [
          factory.createPropertyAccessExpression(
            factory.createNewExpression(
              prefixValueWithModule(
                ctx,
                symbol.getName(),
                ctx.currentFilePath,
                typeFilePath,
                true
              ),
              undefined,
              []
            ),
            factory.createIdentifier("transform")
          ),
        ]
      );
    }
    case "Refine":
      return convertRefineType(ctx, ty, typeSymbol, "refine", diagnosticItem);
    case "SuperRefine":
      return convertRefineType(
        ctx,
        ty,
        typeSymbol,
        "superRefine",
        diagnosticItem
      );
  }
  if (isStainlessSymbol(typeSymbol)) {
    switch (typeSymbol?.getName()) {
      case "Includable":
        return convertSimpleSchemaClassSuffix(
          ctx,
          ty,
          "includable",
          diagnosticItem
        );
      case "Selectable":
        return convertSimpleSchemaClassSuffix(
          ctx,
          ty,
          "selectable",
          diagnosticItem
        );
      case "Selection":
        return convertSimpleSchemaClassSuffix(
          ctx,
          ty,
          "selection",
          diagnosticItem
        );
      case "Includes":
        return convertIncludesSelects(ctx, ty, "includes", diagnosticItem);
      case "Selects":
        return convertIncludesSelects(ctx, ty, "selects", diagnosticItem);
      case "PageResponse":
        return convertSimpleSchemaClassZ(
          ctx,
          ty,
          "pageResponse",
          diagnosticItem
        );
    }
  }

  if (baseTypeName === "ZodType" && isZodSymbol(typeSymbol)) {
    ctx.addError(
      diagnosticItem,
      {
        message:
          "Zod schema types are not valid input types, except as `typeof schemaValue` " +
          "within a top-level type argument or object property",
      },
      true
    );
  }

  switch (packageTypeName) {
    case "NumberSchema":
      return convertPrimitiveSchemaType(
        ctx,
        ty,
        "number",
        packageTypeName,
        numberSchemaProperties,
        diagnosticItem
      );
    case "StringSchema":
      return convertPrimitiveSchemaType(
        ctx,
        ty,
        "string",
        packageTypeName,
        stringSchemaProperties,
        diagnosticItem
      );
    case "BigIntSchema":
      return convertPrimitiveSchemaType(
        ctx,
        ty,
        "bigint",
        packageTypeName,
        bigIntSchemaProperties,
        diagnosticItem
      );
    case "DateSchema":
      return convertPrimitiveSchemaType(
        ctx,
        ty,
        "date",
        packageTypeName,
        dateSchemaProperties,
        diagnosticItem
      );
    case "ObjectSchema": {
      const [objectType, typeArgs] = extractGenericSchemaTypeArguments(ctx, ty);
      return convertSchemaType(
        ctx,
        packageTypeName,
        objectSchemaProperties,
        typeArgs,
        convertType(ctx, objectType, diagnosticItem, true),
        diagnosticItem
      );
    }
    case "ArraySchema": {
      const [elementType, typeArgs] = extractGenericSchemaTypeArguments(
        ctx,
        ty
      );
      const arrayConstructor = zodConstructor("array", [
        convertType(ctx, elementType, diagnosticItem),
      ]);
      return convertSchemaType(
        ctx,
        packageTypeName,
        arraySetSchemaProperties,
        typeArgs,
        arrayConstructor,
        diagnosticItem
      );
    }
    case "SetSchema": {
      const [elementType, typeArgs] = extractGenericSchemaTypeArguments(
        ctx,
        ty
      );
      const setConstructor = zodConstructor("set", [
        convertType(ctx, elementType, diagnosticItem),
      ]);
      return convertSchemaType(
        ctx,
        packageTypeName,
        arraySetSchemaProperties,
        typeArgs,
        setConstructor,
        diagnosticItem
      );
    }
    case "ZodSchema": {
      const typeArguments = ty.getTypeArguments();
      if (typeArguments.length != 1) {
        ctx.addError(
          diagnosticItem,
          { message: "ZodSchema takes one type argument." },
          true
        );
      }
      const schemaContainer = typeArguments[0];
      const schemaProperty = schemaContainer.getProperty("schema");
      if (!schemaProperty) {
        ctx.addError(
          diagnosticItem,
          {
            message:
              "ZodSchema takes in {schema: typeof schemaValue} as a type argument",
          },
          true
        );
      }

      const property = getPropertyDeclaration(schemaProperty);
      if (!property)
        throw new Error(
          "internal error: could not get declaration for `schema` property"
        );
      const typeNode = property.getTypeNode();

      if (!(typeNode instanceof tm.TypeQueryNode)) {
        ctx.addError(
          typeNode ? { variant: "node", node: typeNode } : diagnosticItem,
          {
            message:
              "the `schema` property must have type `typeof schemaValue`.",
          },
          true
        );
      }

      const schemaEntityName = typeNode.getExprName();
      const base = baseIdentifier(schemaEntityName);

      const importPath = getDeclarationDefinitionPath(property);

      const currentFile = ctx.getFileInfo(ctx.currentFilePath);

      currentFile.imports.set(base.getText(), {
        sourceFile: importPath,
        importFromUserFile: true,
        excludeFromUserFile: true,
      });

      const baseSchema = convertEntityNameToExpression(
        schemaEntityName,
        ctx.generateInUserFile
          ? undefined
          : getModuleIdentifier(currentFile, importPath, true)
      );
      return lazy(baseSchema);
    }
  }

  if (!ctx.isRoot && !generateInline && !isNativeSymbol(typeSymbol)) {
    const symbol =
      ty.getAliasSymbol() ||
      ((ty.isClass() || ty.isInterface()) && !isNativeSymbol(typeSymbol)
        ? typeSymbol
        : null);
    if (symbol) {
      const declaration = getDeclaration(symbol);
      if (
        !(
          declaration instanceof tm.TypeAliasDeclaration ||
          declaration instanceof tm.InterfaceDeclaration
        ) ||
        !declaration.getTypeParameters().length
      ) {
        return convertSymbol(ctx, symbol, diagnosticItem);
      }
    }
  }
  ctx.isRoot = false;

  const origin = getTypeOrigin(ty);
  if (origin) return convertType(ctx, origin, diagnosticItem);
  if (ty.isBoolean()) {
    return zodConstructor("boolean");
  }

  switch (baseTypeName) {
    case "PrismaModel":
      return convertPrismaModelType(
        ctx,
        ty,
        typeSymbol!,
        "prismaModel",
        baseTypeName,
        diagnosticItem
      );
    case "PrismaModelLoader":
      return convertPrismaModelType(
        ctx,
        ty,
        typeSymbol!,
        "prismaModelLoader",
        baseTypeName,
        diagnosticItem
      );
  }

  if (ty.isClass()) {
    if (!typeSymbol) {
      ctx.addError(
        diagnosticItem,
        { message: `Could not find class ${ty.getText()}` },
        true
      );
    }
    const declaration = getDeclarationOrThrow(typeSymbol);
    if (!isDeclarationExported(declaration)) {
      ctx.addError(
        { variant: "type", type: ty },
        {
          message:
            "Classes used in Zod schemas must be exported from their modules.",
        }
      );
    }
    const escapedName = `${typeSymbol.getName()}Schema`;
    const sourceFile = declaration.getSourceFile().getFilePath();
    ctx.getFileInfo(ctx.currentFilePath).imports.set(typeSymbol.getName(), {
      importFromUserFile: true,
      as: escapedName,
      sourceFile,
    });
    return zodConstructor("instanceof", [
      prefixValueWithModule(
        ctx,
        typeSymbol.getName(),
        ctx.currentFilePath,
        sourceFile,
        true,
        escapedName
      ),
    ]);
  }
  if (ty.isEnum()) {
    if (!typeSymbol) {
      ctx.addError(
        diagnosticItem,
        { message: `Could not find enum ${ty.getText()}` },
        true
      );
    }
    const declaration = getDeclarationOrThrow(typeSymbol);
    if (!isDeclarationExported(declaration)) {
      ctx.addError(
        { variant: "type", type: ty },
        {
          message:
            "Enums used in Zod schemas must be exported from their modules.",
        }
      );
    }
    const escapedName = `${typeSymbol.getEscapedName()}Schema`;
    const sourceFile = declaration.getSourceFile().getFilePath();
    ctx.getFileInfo(ctx.currentFilePath).imports.set(typeSymbol.getName(), {
      importFromUserFile: true,
      as: escapedName,
      sourceFile,
    });
    return zodConstructor("nativeEnum", [
      prefixValueWithModule(
        ctx,
        typeSymbol.getName(),
        ctx.currentFilePath,
        sourceFile,
        true,
        escapedName
      ),
    ]);
  }
  if (ty.isUnion()) {
    let unionTypes = ty.getUnionTypes();
    return convertUnionTypes(ctx, unionTypes, diagnosticItem);
  }
  if (ty.isIntersection()) {
    const [first, ...rest] = ty.getIntersectionTypes();
    // TODO this was inlining object type aliases, we want to .merge them
    // instead, but we can't do that unless we detect when we can avoid
    // using `.lazy` for type alias references.
    // if (
    //   ty
    //     .getIntersectionTypes()
    //     .every((t) => t.isObject() && !t.isArray() && !isRecord(ctx, t))
    // ) {
    //   return rest.reduce(
    //     (schema, shapeType) =>
    //       methodCall(schema, "extend", [createZodShape(ctx, shapeType)]),
    //     convertType(ctx, first)
    //   );
    // }
    return rest.reduce(
      (prev, next) =>
        methodCall(prev, "and", [convertType(ctx, next, diagnosticItem)]),
      convertType(ctx, first, diagnosticItem)
    );
  }
  if (ty.isArray()) {
    const elemType = ty.getArrayElementTypeOrThrow();
    return zodConstructor("array", [
      convertType(ctx, elemType, diagnosticItem),
    ]);
  }
  if (ty.isTuple()) {
    let tupleTypes = ty.getTupleElements();
    // check for tuple rest element
    // @ts-expect-error compilerType.target is untyped
    const restIndex = ty.compilerType.target.elementFlags.findIndex(
      (flag: ts.ElementFlags) => flag === ts.ElementFlags.Rest
    );

    let restType: tm.Type<ts.Type> | undefined;

    if (restIndex >= 0) {
      if (restIndex != tupleTypes.length - 1) {
        ctx.addError(diagnosticItem, {
          message: "Zod only supports rest elements at the end of tuples.",
        });
        return zodConstructor("any");
      }

      restType = tupleTypes.at(-1);
      // don't include rest type in tuple args
      tupleTypes = tupleTypes.slice(0, -1);
    }

    let schema = zodConstructor("tuple", [
      factory.createArrayLiteralExpression(
        tupleTypes.map((ty) => convertType(ctx, ty, diagnosticItem))
      ),
    ]);

    if (restIndex >= 0) {
      schema = methodCall(schema, "rest", [
        convertType(ctx, restType!, diagnosticItem),
      ]);
    }
    return schema;
  }
  if (ty.isObject()) {
    const callSignatures = ty.getCallSignatures();
    if (callSignatures.length !== 0) {
      if (
        callSignatures.some(
          (signature) => signature.getTypeParameters().length > 0
        )
      ) {
        // TODO: should this be a warning or error?
        return zodConstructor("any");
      }
      const [first, ...rest] = callSignatures;

      return rest.reduce(
        (prev, curr) =>
          methodCall(prev, "and", [
            convertCallSignature(ctx, curr, diagnosticItem),
          ]),
        convertCallSignature(ctx, first, diagnosticItem)
      );
    }
    if (isNativeSymbol(typeSymbol)) {
      // TODO: for these items, the previous diagnostic item is likely more useful. Use
      // that instead.
      switch (typeSymbol?.getName()) {
        case "Date":
          return zodConstructor("date");
        case "Set": {
          const args = ty.getTypeArguments();
          if (args.length !== 1)
            throw new Error(`expected one Set<> type argument`);
          return zodConstructor("set", [
            convertType(ctx, args[0], diagnosticItem),
          ]);
        }
        case "Map": {
          const args = ty.getTypeArguments();
          if (args.length !== 2)
            throw new Error(`expected two Map<> type arguments`);
          return zodConstructor(
            "map",
            args.map((arg) => convertType(ctx, arg, diagnosticItem))
          );
        }
        case "Promise": {
          const args = ty.getTypeArguments();
          if (args.length !== 1)
            throw new Error(`expected one Promise<> type argument`);
          return zodConstructor("promise", [
            convertType(ctx, args[0], diagnosticItem),
          ]);
        }
      }
    }
    // if the object is an indexed access type
    const indexInfos = ctx.typeChecker.compilerObject.getIndexInfosOfType(
      ty.compilerType
    );
    if (indexInfos.length) {
      const valueGroups = Object.values(
        groupBy(
          indexInfos,
          (info) =>
            // @ts-expect-error why would they not expose id property...
            info.type.id
        )
      );
      const recordTypes = valueGroups.map((indexInfos) => {
        const keyTypes = indexInfos.map((indexInfo) =>
          getTypeWrapper(ty, indexInfo.keyType)
        );
        const keyType = convertUnionTypes(ctx, keyTypes, diagnosticItem);
        // TODO: should we set this to property where possible?
        const valueType = convertType(
          ctx,
          getTypeWrapper(ty, indexInfos[0].type),
          diagnosticItem
        );

        return zodConstructor("record", [keyType, valueType]);
      });

      return recordTypes.length === 1
        ? recordTypes[0]
        : zodConstructor("union", [
            factory.createArrayLiteralExpression(recordTypes),
          ]);
    }

    return zodConstructor("object", [createZodShape(ctx, ty)]);
  }
  if (ty.compilerType.flags & ts.TypeFlags.ESSymbol) {
    return zodConstructor("symbol");
  }
  if (ty.isNumber()) {
    return zodConstructor("number");
  }
  if (ty.isBooleanLiteral()) {
    return zodConstructor("literal", [
      isTrueLiteral(ty) ? factory.createTrue() : factory.createFalse(),
    ]);
  }
  if (ty.compilerType.flags === ts.TypeFlags.BigIntLiteral) {
    const value = ty.getLiteralValue() as ts.PseudoBigInt;
    return zodConstructor("literal", [factory.createBigIntLiteral(value)]);
  }
  if (ty.isStringLiteral()) {
    return zodConstructor("literal", [
      factory.createStringLiteral(ty.getLiteralValue() as string),
    ]);
  }
  if (ty.isNumberLiteral()) {
    return zodConstructor("literal", [
      factory.createNumericLiteral(ty.getLiteralValue() as number),
    ]);
  }
  if (ty.isString()) {
    return zodConstructor("string");
  }
  if (ty.compilerType.flags & ts.TypeFlags.BigInt) {
    return zodConstructor("bigint");
  }
  if (ty.isUndefined()) {
    return zodConstructor("undefined");
  }
  if (ty.isNull()) {
    return zodConstructor("null");
  }
  if (ty.compilerType.flags & ts.TypeFlags.Void) {
    return zodConstructor("void");
  }
  if (ty.isAny()) {
    return zodConstructor("any");
  }
  if (ty.isUnknown()) {
    return zodConstructor("unknown");
  }
  if (ty.isNever()) {
    return zodConstructor("never");
  }

  ctx.addError(
    diagnosticItem,
    { message: `unsupported type: ${ty.getText()}` },
    true
  );
}

function zodConstructor(
  ty: string,
  args: readonly ts.Expression[] = []
): ts.Expression {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("z"),
      factory.createIdentifier(ty)
    ),
    undefined,
    args
  );
}

function methodCall(
  target: ts.Expression,
  name: string,
  args: readonly ts.Expression[] = []
): ts.Expression {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      target,
      factory.createIdentifier(name)
    ),
    undefined,
    args
  );
}

function thunk(expression: ts.Expression): ts.Expression {
  return factory.createArrowFunction(
    undefined,
    undefined,
    [],
    undefined,
    undefined,
    expression
  );
}

function lazy(expression: ts.Expression): ts.Expression {
  return zodConstructor("lazy", [thunk(expression)]);
}

function getTypeOrigin(type: ts.Type): ts.Type | undefined;
function getTypeOrigin(type: tm.Type): tm.Type | undefined;
function getTypeOrigin(type: ts.Type | tm.Type): ts.Type | tm.Type | undefined {
  if (type instanceof tm.Type) {
    const origin = getTypeOrigin(type.compilerType);
    return origin ? getTypeWrapper(type, origin) : undefined;
  }
  //@ts-expect-error
  return type.origin;
}

function getTypeWrapper(ctxProvider: tm.Type, type: ts.Type): tm.Type {
  // @ts-expect-error
  return ctxProvider._context.compilerFactory.getType(type);
}

function isSymbolInFile(
  symbol: tm.Symbol | undefined,
  filePattern: RegExp
): boolean {
  if (!symbol) return false;
  const declaration = getDeclaration(symbol);
  const sourceFile = declaration?.getSourceFile().getFilePath();
  if (!sourceFile) return false;
  return sourceFile.match(filePattern) != null;
}

function isNativeSymbol(symbol: tm.Symbol | undefined): boolean {
  return isSymbolInFile(symbol, /typescript\/lib\/.*\.d\.ts$/);
}

function isStainlessSymbol(symbol: tm.Symbol | undefined): boolean {
  return isSymbolInFile(symbol, /stainless\/dist\/.*\.d\.ts$/);
}

function isZodSymbol(symbol: tm.Symbol | undefined): boolean {
  return (
    isSymbolInFile(symbol, /zod\/lib\/.*\.d\.ts$/) || isStainlessSymbol(symbol)
  );
}

function isTsToZodSymbol(symbol: tm.Symbol | undefined): boolean {
  return isStainlessSymbol(symbol);
}

function isStainlessPrismaSymbol(symbol: tm.Symbol | undefined): boolean {
  return isSymbolInFile(symbol, /prisma\/dist\/.*\.d\.ts$/);
}

function createZodShape(
  ctx: ConvertTypeContext,
  type: tm.Type<ts.Type>
): ts.Expression {
  return factory.createObjectLiteralExpression(
    type.getProperties().map((property) => {
      const propertyType = ctx.typeChecker.getTypeOfSymbolAtLocation(
        property,
        ctx.node
      );

      // If the current property has a parent type associated with it, use that
      // parent type for diagnostics information ini order to correctly attribute
      // the source of problematic types.
      let enclosingType = type;
      const propertyDeclaration = getPropertyDeclaration(property);
      if (propertyDeclaration) {
        const parentNode = propertyDeclaration.getParent();
        if (parentNode) {
          const parentType = ctx.typeChecker.getTypeAtLocation(parentNode);
          if (parentType) enclosingType = parentType;
        }
      }

      const propertySchema = convertType(ctx, propertyType, {
        variant: "property",
        name: property.getName(),
        symbol: property,
        enclosingType,
      });

      return factory.createPropertyAssignment(
        property.getName(),
        propertySchema
      );
    })
  );
}

function isTrueLiteral(type: tm.Type): boolean {
  return (
    type.isBooleanLiteral() &&
    // @ts-expect-error untyped api
    type.compilerType.intrinsicName === "true"
  );
}

function isFalseLiteral(type: tm.Type): boolean {
  return (
    type.isBooleanLiteral() &&
    // @ts-expect-error untyped api
    type.compilerType.intrinsicName === "false"
  );
}

function convertCallSignature(
  ctx: ConvertTypeContext,
  callSignature: tm.Signature,
  diagnosticItem: DiagnosticItem
): ts.Expression {
  const argumentTypes = callSignature.getParameters().map((param) => {
    const paramType = param.getTypeAtLocation(ctx.node);
    return convertType(ctx, paramType, diagnosticItem);
  });
  const returnType = convertType(
    ctx,
    callSignature.getReturnType(),
    diagnosticItem
  );
  return zodConstructor("function", [
    zodConstructor("tuple", [
      factory.createArrayLiteralExpression(argumentTypes),
    ]),
    returnType,
  ]);
}

function convertUnionTypes(
  ctx: ConvertTypeContext,
  unionTypes: tm.Type[],
  diagnosticItem: DiagnosticItem
): ts.Expression {
  const isOptional = unionTypes.some((unionType) => unionType.isUndefined());
  const isNullable = unionTypes.some((unionType) => unionType.isNull());

  if (isOptional || isNullable) {
    unionTypes = unionTypes.filter(
      (unionType) => !unionType.isUndefined() && !unionType.isNull()
    );
  }

  // see if the union is made up of objects that each have at least
  // one property that holds a literal in common
  // if so, generate a z.discriminatedUnion instead of a union
  //
  if (unionTypes.length >= 2) {
    const [first, ...rest] = unionTypes;

    const discriminator = first.getProperties().find((property) => {
      const type = property.getTypeAtLocation(ctx.node);
      if (
        !isLiteralish(type) ||
        !rest.every((restType) => {
          const type = restType
            .getProperty(property.getName())
            ?.getTypeAtLocation(ctx.node);
          return type && isLiteralish(type);
        })
      ) {
        return false;
      }

      const literalValues = unionTypes.flatMap((unionType) =>
        getLiteralValues(
          unionType
            .getPropertyOrThrow(property.getName())
            .getTypeAtLocation(ctx.node)
        )
      );
      return new Set(literalValues).size === literalValues.length;
    });

    if (discriminator) {
      return zodConstructor("discriminatedUnion", [
        factory.createStringLiteral(discriminator.getName()),
        factory.createArrayLiteralExpression(
          unionTypes.map((unionType) =>
            convertType(ctx, unionType, diagnosticItem)
          )
        ),
      ]);
    }
  }

  let schema = (() => {
    if (unionTypes.length === 1)
      return convertType(ctx, unionTypes[0], diagnosticItem);

    if (unionTypes.every((unionType) => unionType.isStringLiteral())) {
      return zodConstructor("enum", [
        factory.createArrayLiteralExpression(
          unionTypes.map((unionType) =>
            factory.createStringLiteral(
              unionType.getLiteralValueOrThrow() as string
            )
          )
        ),
      ]);
    }

    // Internally booleans seem to be represented as unions of true or false
    // in some cases, which results in slightly worse codegen, so we simplify
    // in case that both true and false are found
    const hasSyntheticBoolean =
      unionTypes.some(isTrueLiteral) && unionTypes.some(isFalseLiteral);

    const nonSynthBooleanTypes = hasSyntheticBoolean
      ? unionTypes.filter((t) => !t.isBooleanLiteral() && !t.isBoolean())
      : unionTypes;

    if (!nonSynthBooleanTypes.length) return zodConstructor("boolean");

    return zodConstructor("union", [
      factory.createArrayLiteralExpression(
        [
          ...nonSynthBooleanTypes.map((t) =>
            convertType(ctx, t, diagnosticItem)
          ),
          ...(hasSyntheticBoolean ? [zodConstructor("boolean")] : []),
        ],
        false
      ),
    ]);
  })();

  if (isNullable) schema = methodCall(schema, "nullable");
  if (isOptional) schema = methodCall(schema, "optional");
  return schema;
}

function convertRefineType(
  ctx: ConvertTypeContext,
  ty: tm.Type,
  symbol: tm.Symbol | undefined,
  refineType: "refine" | "superRefine",
  diagnosticItem: DiagnosticItem
): ts.Expression {
  if (!symbol) {
    ctx.addError(
      diagnosticItem,
      { message: `failed to get symbol for ${refineType}: ${ty.getText()}` },
      true
    );
  }
  const inputType = ty.getProperty("input")?.getTypeAtLocation(ctx.node);
  if (!inputType) throw new Error("Expected refine to have input property");

  const typeFilePath = getTypeFilePath(ty)!;

  const currentFileInfo = ctx.getFileInfo(ctx.currentFilePath);

  // import the refine class
  currentFileInfo.imports.set(symbol.getName(), {
    importFromUserFile: true,
    sourceFile: typeFilePath,
  });

  const callArgs = [
    factory.createPropertyAccessExpression(
      factory.createNewExpression(
        factory.createIdentifier(symbol.getName()),
        undefined,
        []
      ),
      factory.createIdentifier(refineType)
    ),
  ];

  if (refineType === "refine") {
    callArgs.push(
      factory.createPropertyAccessExpression(
        factory.createNewExpression(
          prefixValueWithModule(
            ctx,
            symbol.getName(),
            ctx.currentFilePath,
            typeFilePath,
            true
          ),
          undefined,
          []
        ),
        factory.createIdentifier("message")
      )
    );
  }

  return methodCall(
    convertType(ctx, inputType, diagnosticItem),
    refineType,
    callArgs
  );
}

function convertPrismaModelType(
  ctx: ConvertTypeContext,
  type: tm.Type,
  symbol: tm.Symbol,
  method: "prismaModel" | "prismaModelLoader",
  baseTypeName: string,
  diagnosticItem: DiagnosticItem
): ts.Expression {
  const inputProperty = type.getProperty("input");
  const inputType = inputProperty?.getTypeAtLocation(ctx.node);

  if (!inputType) {
    ctx.addError(
      diagnosticItem,
      {
        message: `A class extending \`${baseTypeName}\` must have a property called \`input\` specifying the schema with which the prisma model will be associated.`,
      },
      true
    );
  }

  const inputSchema = convertType(ctx, inputType, diagnosticItem);

  const typeFilePath = getTypeFilePath(type)!;

  // import the class
  ctx.getFileInfo(ctx.currentFilePath).imports.set(symbol.getName(), {
    importFromUserFile: true,
    sourceFile: typeFilePath,
    excludeFromUserFile: true,
  });

  return methodCall(inputSchema, method, [
    thunk(
      factory.createPropertyAccessExpression(
        factory.createNewExpression(
          prefixValueWithModule(
            ctx,
            symbol.getName(),
            ctx.currentFilePath,
            typeFilePath,
            true
          ),
          undefined,
          undefined
        ),
        "model"
      )
    ),
  ]);
}

const SCHEMA_TUPLE_TYPE_ERROR = `schema property of type tuple must be of form [<literal value>, "string literal message"]`;

function convertPrimitiveSchemaType(
  ctx: ConvertTypeContext,
  type: tm.Type,
  zodConstructorName: string,
  schemaTypeName: string,
  allowedParameters: Set<string>,
  diagnosticItem: DiagnosticItem
): ts.Expression {
  const args = type.getTypeArguments();
  if (args.length === 0 || !args[0].isObject()) {
    ctx.addError(
      diagnosticItem,
      {
        message:
          "ts-to-zod schema types take object literals as validation properties",
      },
      true
    );
  }
  const [typeArgs] = args;
  return convertSchemaType(
    ctx,
    schemaTypeName,
    allowedParameters,
    typeArgs,
    zodConstructor(zodConstructorName),
    diagnosticItem
  );
}

function extractGenericSchemaTypeArguments(
  ctx: ConvertTypeContext,
  type: tm.Type
): [tm.Type, tm.Type] {
  const args = type.getTypeArguments();
  if (args.length != 2 || !args[1].isObject()) {
    throw new Error(
      "ts-to-zod Object, Array, and Set schema types take two type arguments"
    );
  }
  return args as [tm.Type, tm.Type];
}

function convertIncludesSelects(
  ctx: ConvertTypeContext,
  type: tm.Type,
  name: string,
  diagnosticItem: DiagnosticItem
): ts.Expression {
  const args = type.getTypeArguments();
  if (args.length < 1 || args.length > 2) {
    throw new Error("stainless takes one or two type parameters");
  }
  if (args[1] && !args[1].isNumberLiteral()) {
    ctx.addError(diagnosticItem, {
      message: "expected a single numeric literal between 0 and 5",
    });
  }
  const schemaExpression = convertType(ctx, args[0], diagnosticItem);
  const depth = (args[1].getLiteralValue() as number) || 3;

  return zodConstructor(name, [
    schemaExpression,
    factory.createNumericLiteral(depth),
  ]);
}

function convertSimpleSchemaClassZ(
  ctx: ConvertTypeContext,
  type: tm.Type,
  name: string,
  diagnosticItem: DiagnosticItem
): ts.Expression {
  const args = type.getTypeArguments();
  if (args.length !== 1) {
    throw new Error(`${name} takes one type parameter`);
  }
  const schemaExpression = convertType(ctx, args[0], diagnosticItem);
  return zodConstructor(name, [schemaExpression]);
}

function convertSimpleSchemaClassSuffix(
  ctx: ConvertTypeContext,
  type: tm.Type,
  name: string,
  diagnosticItem: DiagnosticItem
): ts.Expression {
  const args = type.getTypeArguments();
  if (args.length != 1) {
    throw new Error(`expected one type argument for ${name}`);
  }
  const arg = args[0];
  const schemaExpression = convertType(ctx, arg, diagnosticItem);
  return methodCall(schemaExpression, name);
}

function convertSchemaType(
  ctx: ConvertTypeContext,
  schemaTypeName: string,
  allowedParameters: Set<string>,
  typeArgs: tm.Type,
  baseExpression: ts.Expression,
  diagnosticItem: DiagnosticItem
): ts.Expression {
  let expression = baseExpression;

  // Special-cases how to handle string value literals.
  // This is needed for the case of `min` and `max` for
  // `DateSchema`, and `regex` for `StringSchema`, as they take
  // in instances of `Date` and `RegExp`, but
  // users can only pass string literals as type arguments.
  // This function converts those literals to Dates at
  // runtime.
  const createValueStringLiteral = (s: string, property: string) => {
    const stringLiteral = factory.createStringLiteral(s);
    return schemaTypeName === "DateSchema"
      ? factory.createNewExpression(
          factory.createIdentifier("Date"),
          [],
          [stringLiteral]
        )
      : schemaTypeName === "StringSchema" && property === "regex"
      ? factory.createNewExpression(
          factory.createIdentifier("RegExp"),
          [],
          [factory.createStringLiteral(s)]
        )
      : stringLiteral;
  };

  const typeArgsSymbol = typeArgs.getAliasSymbol() || typeArgs.getSymbol();
  if (typeArgsSymbol) {
    const declaration = getDeclaration(typeArgsSymbol);
    if (declaration) {
      diagnosticItem = { variant: "type", type: typeArgs };
    }
  }

  for (const property of typeArgs.getProperties()) {
    diagnosticItem = {
      variant: "property",
      name: property.getName(),
      symbol: property,
      enclosingType: typeArgs,
    };
    const name = property.getName();
    if (!allowedParameters.has(name)) {
      // TODO: customize how this is handled
      ctx.addError(diagnosticItem, {
        message: `${schemaTypeName} does not accept ${name} as a parameter.`,
      });
      continue;
    }

    // ip and datetime are special in that they can take an object as a
    // parameter. This requires special logic in a few cases.
    const ipDatetimeSpecialCase = name === "ip" || name === "datetime";

    const ty = ctx.typeChecker.getTypeOfSymbolAtLocation(property, ctx.node);
    if (
      ipDatetimeSpecialCase &&
      ty.isObject() &&
      !ty.isArray() &&
      !ty.isTuple()
    ) {
      let versionSymbol = ty.getProperty("version");
      let precisionSymbol = ty.getProperty("precision");
      let offsetSymbol = ty.getProperty("offset");
      let messageSymbol = ty.getProperty("message");

      let properties = [];

      if (versionSymbol) {
        properties.push(
          factory.createPropertyAssignment(
            "version",
            factory.createStringLiteral(
              versionSymbol
                .getTypeAtLocation(ctx.node)
                .getLiteralValue() as string
            )
          )
        );
      }
      if (precisionSymbol) {
        properties.push(
          factory.createPropertyAssignment(
            "precison",
            factory.createNumericLiteral(
              precisionSymbol
                .getTypeAtLocation(ctx.node)
                .getLiteralValue() as number
            )
          )
        );
      }
      if (offsetSymbol) {
        properties.push(
          factory.createPropertyAssignment("offset", factory.createTrue())
        );
      }
      if (messageSymbol) {
        properties.push(
          factory.createPropertyAssignment(
            "message",
            factory.createStringLiteral(
              messageSymbol
                .getTypeAtLocation(ctx.node)
                .getLiteralValue() as string
            )
          )
        );
      }

      expression = methodCall(expression, name, [
        factory.createObjectLiteralExpression(properties),
      ]);
      continue;
    }

    if (name === "catchall") {
      expression = methodCall(expression, "catchall", [
        convertType(ctx, ty, diagnosticItem),
      ]);
      continue;
    }

    let literalValue;
    literalValue =
      ty.getLiteralValue() || ty.getFlags() === ts.TypeFlags.BooleanLiteral;
    let literalMessage;
    if (literalValue) {
    } else if (ty.isTuple()) {
      const tupleTypes = ty.getTupleElements();
      if (tupleTypes.length != 2) {
        ctx.addError(diagnosticItem, {
          message: SCHEMA_TUPLE_TYPE_ERROR,
        });
        continue;
      } else if (ipDatetimeSpecialCase) {
        ctx.addError(diagnosticItem, {
          message: `The StringSchema ${name} property does not accept a tuple with error string information.`,
        });
        continue;
      }
      const [literalType, messageType] = tupleTypes;
      const value =
        literalType.getLiteralValue() ||
        literalType.getFlags() === ts.TypeFlags.BooleanLiteral;
      if (!value || messageType.getFlags() !== ts.TypeFlags.StringLiteral) {
        ctx.addError(diagnosticItem, {
          message: SCHEMA_TUPLE_TYPE_ERROR,
        });
        continue;
      }

      literalValue = value;
      literalMessage = messageType.getLiteralValue() as string;
    } else {
      ctx.addError(diagnosticItem, {
        message: `Invalid parameter value passed for ${name}`,
      });
      continue;
    }

    if (literalValue) {
      let args: ts.Expression[];
      if (typeof literalValue === "string")
        args = [createValueStringLiteral(literalValue, name)];
      else if (typeof literalValue === "number")
        args = [factory.createNumericLiteral(literalValue)];
      else if (typeof literalValue === "bigint")
        args = [factory.createBigIntLiteral(literalValue)];
      else args = [];
      if (literalMessage)
        args.push(factory.createStringLiteral(literalMessage));
      expression = methodCall(expression, name, args);
    }
  }

  return expression;
}

function mapGetOrCreate<K, V>(map: Map<K, V>, key: K, init: () => V): V {
  let value = map.get(key);
  if (!value) {
    value = init();
    map.set(key, value);
  }

  return value;
}

function isDeclarationExported(declaration: tm.Node): boolean {
  // @ts-expect-error localSymbol untyped
  return declaration.compilerNode.localSymbol?.exportSymbol != null;
}

function getTypeId(type: tm.Type): number {
  // @ts-expect-error id is untyped
  return type.compilerType.id;
}

function getBaseTypeName(type: tm.Type): string | undefined {
  const symbol = type.getSymbol();
  if (!symbol) return undefined;
  const declaration = getDeclaration(symbol);
  if (!declaration) return;
  if (
    !tm.Node.isClassDeclaration(declaration) &&
    !tm.Node.isClassExpression(declaration)
  )
    return undefined;
  const heritageClause = declaration.getHeritageClauseByKind(
    ts.SyntaxKind.ExtendsKeyword
  );
  const extendsTypeNode = heritageClause?.getTypeNodes()[0];
  const baseSymbol = extendsTypeNode?.getType().getSymbol();
  return baseSymbol?.getName();
}

/** Is a type either a literal or union of literalish types */
function isLiteralish(ty: tm.Type): boolean {
  if (ty.isLiteral()) return true;
  else if (ty.isUnion()) {
    const unionTypes = ty.getUnionTypes();
    return unionTypes.every((unionType) => isLiteralish(unionType));
  } else return false;
}

function getLiteralValues(
  type: tm.Type
): (string | boolean | number | ts.PseudoBigInt | undefined)[] {
  if (type.isLiteral()) return [type.getLiteralValue()];
  else if (type.isUnion())
    return type
      .getUnionTypes()
      .flatMap((unionType) => getLiteralValues(unionType));
  else return [];
}

function getTypeFilePath(type: tm.Type): string | undefined {
  return getTypeDeclaration(type)?.getSourceFile()?.getFilePath();
}

function getTypeDeclaration(type: tm.Type): tm.Node | undefined {
  const symbol = type.getAliasSymbol() || type.getSymbol();
  if (!symbol) return;
  return getDeclaration(symbol);
}

function getDeclaration(symbol: tm.Symbol): tm.Node | undefined {
  let importDeclaration: tm.ImportSpecifier | undefined;
  const declarations = symbol.getDeclarations();
  for (const declaration of declarations) {
    if (declaration instanceof tm.ImportSpecifier && !importDeclaration) {
      importDeclaration = declaration;
    }
    if (
      declaration instanceof tm.TypeAliasDeclaration ||
      declaration instanceof tm.InterfaceDeclaration ||
      declaration instanceof tm.ClassDeclaration ||
      declaration instanceof tm.ClassExpression ||
      declaration instanceof tm.TypeLiteralNode ||
      declaration instanceof tm.EnumDeclaration
    ) {
      return declaration;
    }
  }
  if (importDeclaration) {
    const symbol = importDeclaration.getSymbol();
    if (symbol && !symbol.getValueDeclaration()) {
      return importDeclaration;
    }
  }
  return undefined;
}

function getDeclarationOrThrow(symbol: tm.Symbol): tm.Node {
  const declaration = getDeclaration(symbol);
  if (!declaration) {
    throw new Error("could not get type declaration for that symbol");
  } else return declaration;
}

// TODO: move to utils file
export function getPropertyDeclaration(
  symbol: tm.Symbol
): tm.PropertyDeclaration | tm.PropertySignature | undefined {
  for (const declaration of symbol.getDeclarations()) {
    if (
      declaration instanceof tm.PropertyDeclaration ||
      declaration instanceof tm.PropertySignature
    ) {
      return declaration;
    }
  }
}

/** Converts a path into an identifier suitable for local use within a file */
function mangleString(str: string): string {
  const unicodeLetterRegex = /\p{L}/u;
  const escapedStringBuilder = ["__"];
  for (const codePointString of str) {
    if (codePointString === Path.sep) {
      escapedStringBuilder.push("$");
    } else if (unicodeLetterRegex.test(codePointString)) {
      escapedStringBuilder.push(codePointString);
    } else {
      escapedStringBuilder.push(`u${codePointString.codePointAt(0)}`);
    }
  }
  return escapedStringBuilder.join("");
}
