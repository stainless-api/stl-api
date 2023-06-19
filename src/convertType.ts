import { ts } from "ts-morph";
const { factory } = ts;
import * as tm from "ts-morph";
import { groupBy, method, property } from "lodash";
import { boolean } from "zod";

export class SchemaGenContext {
  constructor(
    public project: tm.Project,
    public typeChecker = project.getTypeChecker(),
    public files: Map<string, FileInfo> = new Map(),
    public symbols: Set<tm.Symbol> = new Set()
  ) {}

  getFileInfo(filePath: string): FileInfo {
    return mapGetOrCreate(this.files, filePath, () => ({
      imports: new Map(),
      generatedSchemas: [],
    }));
  }

  // addImportToFile(symbol: tm.Symbol, filePath: string, importInfo: ImportInfo = {}) {
  // this.getFileInfo(filePath).imports.set(symbol, importInfo);
  // }
}

export class ConvertTypeContext extends SchemaGenContext {
  constructor(ctx: SchemaGenContext, public node: tm.Node) {
    super(ctx.project, ctx.typeChecker, ctx.files, ctx.symbols);
    this.isRoot = true;
    this.currentFilePath = this.node.getSourceFile().getFilePath();
  }

  isRoot: boolean;
  currentFilePath: string;

  isSymbolImported(symbol: tm.Symbol): boolean {
    const symbolFileName: string = symbol
      .getDeclarations()[0]
      .getSourceFile()
      .getFilePath();
    return this.currentFilePath !== symbolFileName;
  }
}

interface ImportInfo {
  as?: string;
  /**
   * If true, the output code will import from
   * the original file associated with the import's symbol; otherwise
   * it will import from the generated file associated with
   * `symbol`.
   */
  importFromUserFile?: boolean;
}

interface FileInfo {
  imports: Map<tm.Symbol, ImportInfo>;
  generatedSchemas: GeneratedSchema[];
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

interface GeneratedSchema {
  symbol: tm.Symbol;
  expression: ts.Expression;
  isExported: boolean;
}

export function convertSymbol(ctx: SchemaGenContext, symbol: tm.Symbol) {
  let importAs;
  if (ctx instanceof ConvertTypeContext) {
    if (ctx.isSymbolImported(symbol)) {
      const fileInfo = ctx.getFileInfo(ctx.currentFilePath);
      const importTypeNameMap = (fileInfo.importTypeNameMap ||=
        buildImportTypeMap(ctx.node.getSourceFile()));
      importAs = importTypeNameMap.get(
        getTypeId(symbol.getTypeAtLocation(ctx.node))
      );
      fileInfo.imports.set(symbol, { as: importAs });
    }
  }
  if (!ctx.symbols.has(symbol)) {
    ctx.symbols.add(symbol);
    const declaration = symbol.getDeclarations()[0];
    const internalCtx = new ConvertTypeContext(ctx, declaration);
    const type = declaration.getType();
    const generated = convertType(internalCtx, type);
    const generatedSchema = {
      symbol,
      expression: generated,
      isExported: isDeclarationExported(declaration),
    };

    const fileName = declaration.getSourceFile().getFilePath();
    mapGetOrCreate(ctx.files, fileName, () => ({
      imports: new Map(),
      generatedSchemas: [],
    })).generatedSchemas.push(generatedSchema);
  }

  return zodConstructor("lazy", [
    factory.createArrowFunction(
      [],
      [],
      [],
      undefined,
      undefined,
      factory.createIdentifier(importAs || symbol.getName())
    ),
  ]);
}

export function convertType(
  ctx: ConvertTypeContext,
  ty: tm.Type
): ts.Expression {
  if (isTransform(ty)) {
    const symbol = ty.getSymbolOrThrow(
      `failed to get symbol for transform: ${ty.getText()}`
    );
    const inputType = getTransformInputType(ty);

    // import the transform class
    ctx.getFileInfo(ctx.currentFilePath).imports.set(symbol, {});

    return methodCall(convertType(ctx, inputType), "transform", [
      factory.createPropertyAccessExpression(
        factory.createNewExpression(
          factory.createIdentifier(symbol.getName()),
          undefined,
          []
        ),
        factory.createIdentifier("transform")
      ),
    ]);
  }

  if (!ctx.isRoot && !isNativeObject(ty)) {
    const symbol =
      ty.getAliasSymbol() ||
      (ty.isInterface() && !isNativeObject(ty) ? ty.getSymbol() : null);
    if (symbol) {
      const declaration = symbol.getDeclarations()[0];
      if (
        !(
          declaration instanceof tm.TypeAliasDeclaration ||
          declaration instanceof tm.InterfaceDeclaration
        ) ||
        !declaration.getTypeParameters().length
      ) {
        return convertSymbol(ctx, symbol);
      }
    }
  }
  ctx.isRoot = false;

  const origin = getTypeOrigin(ty);
  if (origin) return convertType(ctx, origin);
  if (ty.isBoolean()) {
    return zodConstructor("boolean");
  }
  if (ty.isEnum()) {
    const symbol = ty.getSymbolOrThrow();
    const escapedName = `__enum_${symbol.compilerSymbol.escapedName as string}`;
    ctx
      .getFileInfo(ctx.currentFilePath)
      .imports.set(symbol, { importFromUserFile: true, as: escapedName });

    return zodConstructor("nativeEnum", [
      factory.createIdentifier(escapedName),
    ]);
  }
  if (ty.isUnion()) {
    let unionTypes = ty.getUnionTypes();
    return convertUnionTypes(ctx, unionTypes);
  }
  if (ty.isIntersection()) {
    const [first, ...rest] = ty.getIntersectionTypes();
    if (
      ty
        .getIntersectionTypes()
        .every((t) => t.isObject() && !t.isArray() && !isRecord(ctx, t))
    ) {
      return rest.reduce(
        (schema, shapeType) =>
          methodCall(schema, "extend", [createZodShape(ctx, shapeType)]),
        convertType(ctx, first)
      );
    }
    return rest.reduce(
      (prev, next) => methodCall(prev, "and", [convertType(ctx, next)]),
      convertType(ctx, first)
    );
  }
  if (ty.isArray()) {
    const elemType = ty.getArrayElementTypeOrThrow();
    return zodConstructor("array", [convertType(ctx, elemType)]);
  }
  if (ty.isTuple()) {
    let tupleTypes = ty.getTupleElements();
    // check for tuple rest element
    // @ts-expect-error compilerType.target is untyped
    const restIndex = ty.compilerType.target.elementFlags.findIndex(
      (flag: ts.ElementFlags) => flag === ts.ElementFlags.Rest
    );

    let restType;

    if (restIndex >= 0) {
      if (restIndex != tupleTypes.length - 1) {
        throw new Error(
          "zod only supports rest elements at the end of tuples."
        );
      }

      restType = tupleTypes.at(-1);
      // don't include rest type in tuple args
      tupleTypes = tupleTypes.slice(0, -1);
    }

    let schema = zodConstructor("tuple", [
      factory.createArrayLiteralExpression(
        tupleTypes.map((ty) => convertType(ctx, ty))
      ),
    ]);

    if (restIndex >= 0) {
      schema = methodCall(schema, "rest", [convertType(ctx, restType!)]);
    }
    return schema;
  }
  if (ty.isObject()) {
    if (isNativeObject(ty)) {
      switch (ty.getSymbol()?.getName()) {
        case "Date":
          return zodConstructor("date");
        case "Set": {
          const args = ty.getTypeArguments();
          if (args.length !== 1)
            throw new Error(`expected one Set<> type argument`);
          return zodConstructor("set", [convertType(ctx, args[0])]);
        }
        case "Map": {
          const args = ty.getTypeArguments();
          if (args.length !== 2)
            throw new Error(`expected two Map<> type arguments`);
          return zodConstructor(
            "map",
            args.map((arg) => convertType(ctx, arg))
          );
        }
        case "Promise": {
          const args = ty.getTypeArguments();
          if (args.length !== 1)
            throw new Error(`expected one Promise<> type argument`);
          return zodConstructor("promise", [convertType(ctx, args[0])]);
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
        const keyType = convertUnionTypes(ctx, keyTypes);
        const valueType = convertType(
          ctx,
          getTypeWrapper(ty, indexInfos[0].type)
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

  throw new Error(`unsupported type: ${ty.getText()}`);
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

/** The file in which a type was declared. Likely unsuitable for use for interfaces that might be extended. */
function typeSourceFile(ty: ts.Type): string | undefined {
  return ty.getSymbol()?.declarations?.[0]?.getSourceFile().fileName;
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

function getSymbolWrapper(
  ctxProvider: tm.Symbol,
  symbol: ts.Symbol
): tm.Symbol {
  // @ts-expect-error
  return ctxProvider._context.compilerFactory.getSymbol(symbol);
}

function isNativeObject(ty: ts.Type | tm.Type): boolean {
  if (ty instanceof tm.Type) return isNativeObject(ty.compilerType);
  const sourceFile = typeSourceFile(ty);
  return sourceFile?.match(/typescript\/lib\/.*\.d\.ts$/) != null;
}
function createZodShape(
  ctx: ConvertTypeContext,
  ty: tm.Type<ts.Type>
): ts.Expression {
  return factory.createObjectLiteralExpression(
    ty.getProperties().map((property) => {
      const ty = ctx.typeChecker.getTypeOfSymbolAtLocation(property, ctx.node);
      return factory.createPropertyAssignment(
        property.getName(),
        convertType(ctx, ty)
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

function convertUnionTypes(
  ctx: ConvertTypeContext,
  unionTypes: tm.Type[]
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
          unionTypes.map((unionType) => convertType(ctx, unionType))
        ),
      ]);
    }
  }

  let schema = (() => {
    if (unionTypes.length === 1) return convertType(ctx, unionTypes[0]);

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
          ...nonSynthBooleanTypes.map((t) => convertType(ctx, t)),
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

function isRecord(ctx: SchemaGenContext, ty: tm.Type): boolean {
  const indexInfos = ctx.typeChecker.compilerObject.getIndexInfosOfType(
    ty.compilerType
  );
  return !indexInfos.length;
}

function isInThisPackage(symbol: tm.Symbol): boolean {
  const symbolFile = symbol.getDeclarations()[0].getSourceFile().getFilePath();
  return !Path.relative(Path.dirname(__filename), symbolFile).startsWith(".");
}

function isTransform(type: tm.Type): boolean {
  const symbol = type.getSymbol();
  if (!symbol) return false;
  const declaration = symbol.getDeclarations()[0];
  if (
    !tm.Node.isClassDeclaration(declaration) &&
    !tm.Node.isClassExpression(declaration)
  )
    return false;
  const heritageClause = declaration.getHeritageClauseByKind(
    ts.SyntaxKind.ExtendsKeyword
  );
  const extendsTypeNode = heritageClause?.getTypeNodes()[0];
  const baseSymbol = extendsTypeNode?.getType().getSymbol();
  if (!baseSymbol) return false;
  return isInThisPackage(baseSymbol) && baseSymbol.getName() === "Transform";
}

function getTransformInputType(ty: tm.Type): tm.Type {
  const inputType = ty.getTypeArguments()[0];
  if (!inputType) {
    throw new Error(
      `can't convert transform ${ty.getText()} because it doesn't have an input type parameter`
    );
  }
  return inputType;
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
