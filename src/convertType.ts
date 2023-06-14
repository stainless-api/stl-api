import { ts } from "ts-morph";
const { factory } = ts;
import * as tm from "ts-morph";
import { groupBy } from "lodash";

export interface SchemaGenContext {
  project: tm.Project;
  typeChecker: tm.TypeChecker;
  node: tm.Node;
}

// steps to do
// build up map: process a type if it is not already in map, in order to avoid infinitely recursing
//    think about how to avoid this infinite recursion, probably need to use zod.lazy()... at first don't worry about thisd
// for type aliases: things to process:
// - union
//   - if all elements are string literals, utilize zod.enum
//   - else recursively process types, utilize zod.union()
// - enum
//   - utilize zod.nativeEnum
export function convertType(ctx: SchemaGenContext, ty: tm.Type): ts.Expression {
  const origin = getTypeOrigin(ty);
  if (origin) return convertType(ctx, origin);
  if (ty.isBoolean()) {
    return zodConstructor("boolean");
  }
  if (ty.isEnum()) {
    return zodConstructor("nativeEnum", [
      factory.createIdentifier(
        ty.compilerType.getSymbol()?.escapedName as string
      ),
    ]);
  }
  if (ty.isUnion()) {
    let unionTypes = ty.getUnionTypes();
    return convertUnionTypes(ctx, unionTypes);
  }
  if (ty.isIntersection()) {
    if (ty.getIntersectionTypes().every((t) => t.isObject())) {
      const [first, ...rest] = ty.getIntersectionTypes();
      return rest.reduce(
        (schema, shapeType) =>
          methodCall(schema, "extend", [createZodShape(ctx, shapeType)]),
        convertType(ctx, first)
      );
    }
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
  ctx: SchemaGenContext,
  ty: tm.Type<ts.Type>
): ts.Expression {
  return factory.createObjectLiteralExpression(
    ty.getProperties().map((property) => {
      // const ty = getTypeOfSymbol(ctx, property);
      const ty = ctx.typeChecker.getTypeOfSymbolAtLocation(property, ctx.node);
      return factory.createPropertyAssignment(
        property.getName(),
        convertType(ctx, ty)
      );
    })
  );
}

function getTypeOfSymbol(ctx: SchemaGenContext, symbol: tm.Symbol): tm.Type {
  console.log(symbol.getDeclarations());
  return ctx.typeChecker.getTypeOfSymbolAtLocation(
    symbol,
    symbol.getDeclarations()![0]
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
  ctx: SchemaGenContext,
  unionTypes: tm.Type[]
): ts.Expression {
  const isOptional = unionTypes.some((unionType) => unionType.isUndefined());
  const isNullable = unionTypes.some((unionType) => unionType.isNull());

  if (isOptional || isNullable) {
    unionTypes = unionTypes.filter(
      (unionType) => !unionType.isUndefined() && !unionType.isNull()
    );
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
    return zodConstructor("union", [
      factory.createArrayLiteralExpression(
        [
          ...(hasSyntheticBoolean
            ? unionTypes.filter((t) => !t.isBooleanLiteral() && !t.isBoolean())
            : unionTypes
          ).map((t) => convertType(ctx, t)),
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
