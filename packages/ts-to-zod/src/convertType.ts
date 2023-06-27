import { ts } from "ts-morph";
const { factory } = ts;
import * as tm from "ts-morph";
import { groupBy, method, property } from "lodash";
import Path from "path";
import {
  arraySetSchemaProperties,
  bigIntSchemaProperties,
  dateSchemaProperties,
  numberSchemaProperties,
  objectSchemaProperties,
  stringSchemaProperties,
} from "./typeSchemaUtils";

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

export interface ImportInfo {
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
  let escapedImport;
  let isRoot = false;
  if (ctx instanceof ConvertTypeContext) {
    isRoot = ctx.isRoot;
    if (ctx.isSymbolImported(symbol)) {
      const fileInfo = ctx.getFileInfo(ctx.currentFilePath);
      const importTypeNameMap = (fileInfo.importTypeNameMap ||=
        buildImportTypeMap(ctx.node.getSourceFile()));
      const importAs = importTypeNameMap.get(
        getTypeId(symbol.getTypeAtLocation(ctx.node))
      );
      escapedImport = `__symbol_${importAs || symbol.getName()}`
      fileInfo.imports.set(symbol, { as: escapedImport });
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
      isExported: isRoot || isDeclarationExported(declaration),
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
      factory.createIdentifier(escapedImport || symbol.getName())
    ),
  ]);
}

export function convertType(
  ctx: ConvertTypeContext,
  ty: tm.Type
): ts.Expression {
  const packageBaseTypeName = getPackageBaseTypeName(ty);
  if (packageBaseTypeName === "Transform") {
    const symbol = ty.getSymbolOrThrow(
      `failed to get symbol for transform: ${ty.getText()}`
    );
    const inputType = getNthBaseClassTypeArgument(ty, 0);

    // import the transform class
    ctx
      .getFileInfo(ctx.currentFilePath)
      .imports.set(symbol, { importFromUserFile: true });

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

  if (packageBaseTypeName === "Refine") {
    return convertRefineType(ctx, ty, "refine");
  }

  if (packageBaseTypeName === "SuperRefine") {
    return convertRefineType(ctx, ty, "superRefine");
  }

  let packageTypeName = undefined;
  const typeSymbol = ty.getSymbol();
  if (typeSymbol && isInThisPackage(typeSymbol)) {
    packageTypeName = typeSymbol.getName();
  }

  switch (packageTypeName) {
    case "NumberSchema":
      return convertPrimitiveSchemaType(
        ctx,
        ty,
        "number",
        packageTypeName,
        numberSchemaProperties
      );
    case "StringSchema":
      return convertPrimitiveSchemaType(
        ctx,
        ty,
        "string",
        packageTypeName,
        stringSchemaProperties
      );
    case "BigIntSchema":
      return convertPrimitiveSchemaType(
        ctx,
        ty,
        "bigint",
        packageTypeName,
        bigIntSchemaProperties
      );
    case "DateSchema":
      return convertPrimitiveSchemaType(
        ctx,
        ty,
        "date",
        packageTypeName,
        dateSchemaProperties
      );
    case "ObjectSchema": {
      const [objectType, typeArgs] = extractGenericSchemaTypeArguments(ctx, ty);
      return convertSchemaType(
        ctx,
        packageTypeName,
        objectSchemaProperties,
        typeArgs,
        convertType(ctx, objectType)
      );
    }
    case "ArraySchema": {
      const [elementType, typeArgs] = extractGenericSchemaTypeArguments(
        ctx,
        ty
      );
      const arrayConstructor = zodConstructor("array", [
        convertType(ctx, elementType),
      ]);
      return convertSchemaType(
        ctx,
        packageTypeName,
        arraySetSchemaProperties,
        typeArgs,
        arrayConstructor
      );
    }
    case "SetSchema": {
      const [elementType, typeArgs] = extractGenericSchemaTypeArguments(
        ctx,
        ty
      );
      const setConstructor = zodConstructor("set", [
        convertType(ctx, elementType),
      ]);
      return convertSchemaType(
        ctx,
        packageTypeName,
        arraySetSchemaProperties,
        typeArgs,
        setConstructor
      );
    }
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
  if (ty.isClass()) {
    const symbol = ty.getSymbolOrThrow();
    const escapedName = `__class_${symbol.compilerSymbol.escapedName}`;
    ctx
      .getFileInfo(ctx.currentFilePath)
      .imports.set(symbol, { importFromUserFile: true, as: escapedName });
    return zodConstructor("instanceof", [
      factory.createIdentifier(escapedName),
    ]);
  }
  if (ty.isEnum()) {
    const symbol = ty.getSymbolOrThrow();
    const escapedName = `__enum_${symbol.compilerSymbol.escapedName}`;
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

    let restType: tm.Type<ts.Type> | undefined;

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
          methodCall(prev, "and", [convertCallSignature(ctx, curr)]),
        convertCallSignature(ctx, first)
      );
    }
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

function convertCallSignature(
  ctx: ConvertTypeContext,
  callSignature: tm.Signature
): ts.Expression {
  const argumentTypes = callSignature.getParameters().map((param) => {
    const paramType = param.getTypeAtLocation(ctx.node);
    return convertType(ctx, paramType);
  });
  const returnType = convertType(ctx, callSignature.getReturnType());
  return zodConstructor("function", [
    zodConstructor("tuple", [
      factory.createArrayLiteralExpression(argumentTypes),
    ]),
    returnType,
  ]);
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

function convertRefineType(
  ctx: ConvertTypeContext,
  ty: tm.Type,
  refineType: "refine" | "superRefine"
): ts.Expression {
  const symbol = ty.getSymbolOrThrow(
    `failed to get symbol for ${refineType}: ${ty.getText()}`
  );
  const inputType = getNthBaseClassTypeArgument(ty, 0);

  // import the refine class
  ctx
    .getFileInfo(ctx.currentFilePath)
    .imports.set(symbol, { importFromUserFile: true });

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
          factory.createIdentifier(symbol.getName()),
          undefined,
          []
        ),
        factory.createIdentifier("message")
      )
    );
  }

  return methodCall(convertType(ctx, inputType), refineType, callArgs);
}

const SCHEMA_TUPLE_TYPE_ERROR = `schema property of type tuple must be of form [<literal value>, "string literal message"]`;

function convertPrimitiveSchemaType(
  ctx: ConvertTypeContext,
  type: tm.Type,
  zodConstructorName: string,
  schemaTypeName: string,
  allowedParameters: Set<string>
): ts.Expression {
  const args = type.getTypeArguments();
  if (args.length === 0 || !args[0].isObject()) {
    throw new Error(
      "ts-to-zod schema types take object literals as validation properties"
    );
  }
  const [typeArgs] = args;
  return convertSchemaType(
    ctx,
    schemaTypeName,
    allowedParameters,
    typeArgs,
    zodConstructor(zodConstructorName)
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

function convertSchemaType(
  ctx: ConvertTypeContext,
  schemaTypeName: string,
  allowedParameters: Set<string>,
  typeArgs: tm.Type,
  baseExpression: ts.Expression
): ts.Expression {
  let expression = baseExpression;

  // Special-cases how to handle string value literals.
  // This is needed for the case of `min` and `max` for
  // `DateSchema`, as they take in instances of `Date`, but
  // users can only pass string literals as type arguments.
  // This function converts those literals to Dates at
  // runtime.
  const createValueStringLiteral = (s: string) => {
    const stringLiteral = factory.createStringLiteral(s);
    return schemaTypeName === "DateSchema"
      ? factory.createNewExpression(
          factory.createIdentifier("Date"),
          [],
          [stringLiteral]
        )
      : stringLiteral;
  };

  for (const property of typeArgs.getProperties()) {
    const name = property.getName();
    if (!allowedParameters.has(name)) {
      throw new Error(
        `${schemaTypeName} does not accept ${name} as a parameter.`
      );
    }

    // ip and datetime are special in that they can take an object as a
    // parameter. This requires special logic in a few cases.
    const ipDatetimeSpecialCase = name === "ip" || name === "datetime";

    const ty = ctx.typeChecker.getTypeOfSymbolAtLocation(property, ctx.node);
    if (ipDatetimeSpecialCase && ty.isObject() && !ty.isArray()) {
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
      expression = methodCall(expression, "catchall", [convertType(ctx, ty)]);
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
        throw new Error(SCHEMA_TUPLE_TYPE_ERROR);
      } else if (ipDatetimeSpecialCase) {
        throw new Error(
          `The DateSchema ${name} property does not accept a tuple with error string information.`
        );
      }
      const [literalType, messageType] = tupleTypes;
      const value =
        literalType.getLiteralValue() ||
        literalType.getFlags() === ts.TypeFlags.BooleanLiteral;
      if (!value || messageType.getFlags() !== ts.TypeFlags.StringLiteral) {
        throw new Error(SCHEMA_TUPLE_TYPE_ERROR);
      }

      literalValue = value;
      literalMessage = messageType.getLiteralValue() as string;
    } else throw new Error(`invalid parameter value passed for ${name}`);

    if (literalValue) {
      let args: ts.Expression[];
      if (typeof literalValue === "string")
        args = [createValueStringLiteral(literalValue)];
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

function isInThisPackage(symbol: tm.Symbol): boolean {
  const declarations = symbol.getDeclarations();
  if (!declarations.length) return false;
  const symbolFile = declarations[0].getSourceFile().getFilePath();
  return !Path.relative(Path.dirname(__filename), symbolFile).startsWith(".");
}

function getPackageBaseTypeName(type: tm.Type): string | undefined {
  const symbol = type.getSymbol();
  if (!symbol) return undefined;
  const declaration = symbol.getDeclarations()[0];
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
  if (!baseSymbol) return undefined;
  return isInThisPackage(baseSymbol) ? baseSymbol.getName() : undefined;
}

/** Assuming there is one base class of the given type argument, gets its nth type argument */
function getNthBaseClassTypeArgument(ty: tm.Type, n: number): tm.Type {
  const targetType = ty.getTargetType();
  if (!targetType)
    throw new Error(
      `internal error: can't convert transform ${ty.getText()} due to lack of target type`
    );
  const rawInputType = targetType.getBaseTypes()[0].getTypeArguments()[n];
  const typeArgumentNames = targetType
    .getTypeArguments()
    .map((arg) => arg.getText());
  const rawInputName = rawInputType.getSymbol()?.compilerSymbol.escapedName;
  if (!rawInputName) return rawInputType;
  const inputTypePos = typeArgumentNames.findIndex(
    (name) => name === rawInputName
  );
  if (inputTypePos >= 0) return ty.getTypeArguments()[inputTypePos];
  else return rawInputType;
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
