import { Project, ts, printNode } from "ts-morph";
const { factory } = ts;
import * as tm from "ts-morph";
import * as path from "path";
import { inspect } from "util";
import { Schema } from "inspector";

function main(fileName: string, compilerOptions: ts.CompilerOptions) {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(fileName);
  const ctx = {
    project,
    typeChecker: project.getTypeChecker(),
  };
  resolveTypeSandbox(
    ctx,
    sourceFile.getTypeAlias("Conditional")?.getType() ||
      ((): tm.Type => {
        throw new Error("missing Conditional type");
      })(),
    sourceFile.getTypeAlias("Conditional")
  );
  const type = sourceFile.getTypeAlias("StringOrNumber")?.getType();
  if (!type) throw new Error(`type not found`);
  console.log(printNode(processType(ctx, type)));
}

function resolveTypeSandbox(
  ctx: SchemaGenContext,
  ty: tm.Type,
  node: tm.Node | undefined
) {
  const test = ctx.typeChecker.getApparentType(ty);
  console.log("test", test)
  console.log("ty.getText()", ty.getText());
  console.log(
    ty
      .getAliasSymbol()
      ?.getTypeAtLocation(node as any)
      .getText()
  );
}

/* visit nodes declaring interfaces and types */
function visit(node: ts.Node) {
  if (ts.isInterfaceDeclaration(node)) {
    console.log("interface:", node.name.getText());
  }
  // Only consider exported nodes
  // TODO

  // if (ts.isExportDeclaration(node)) {
  // console.log(node);
  // }
}

main(path.resolve(__dirname, "test_code/simple.ts"), {
  noImplicitAny: true,
});

interface SchemaGenContext {
  project: tm.Project;
  typeChecker: tm.TypeChecker;
}

// steps to do
// visit all nodes in a file
// visit typealias declarations and interface declarations
// build up map: process a type if it is not already in map, in order to avoid infinitely recursing
//    think about how to avoid this infinite recursion, probably need to use zod.lazy()... at first don't worry about thisd
// for type aliases: things to process:
// - union
//   - if all elements are string literals, utilize zod.enum
//   - else recursively process types, utilize zod.union()
// - enum
//   - utilize zod.nativeEnum
// - intersection:
//   - recursively process involved types, then ensure they're objects
//   - if involved types objects, utilize zod merge facilities
//   - otherwise either error out or emit zod.any for the intersection
// -
// - basic types: trivial
//
//
function processType(ctx: SchemaGenContext, ty: tm.Type): ts.Expression {
  if (ty.isUnion()) {
    return zodConstructor("union", [
      factory.createArrayLiteralExpression(
        ty.getUnionTypes().map((t) => processType(ctx, t)),
        false
      ),
    ]);
  }
  if (ty.isIntersection()) {
    if (ty.getIntersectionTypes().every((t) => t.isObject())) {
      const [first, ...rest] = ty.getIntersectionTypes();
      return rest.reduce(
        (schema, shapeType) =>
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              schema,
              factory.createIdentifier("merge")
            ),
            undefined,
            [createZodShape(ctx, shapeType)]
          ),
        processType(ctx, first)
      );
    }
  }
  if (ty.isArray()) {
    const elemType = ty.getArrayElementTypeOrThrow();
    return zodConstructor("array", [processType(ctx, elemType)]);
  }
  if (ty.isTuple()) {
    const tupleTypes = ty.getTupleElements();
    return zodConstructor("tuple", [
      factory.createArrayLiteralExpression(
        tupleTypes.map((ty) => processType(ctx, ty))
      ),
    ]);
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
          return zodConstructor("set", [processType(ctx, args[0])]);
        }
        case "Map": {
          const args = ty.getTypeArguments();
          if (args.length !== 2)
            throw new Error(`expected two Map<> type arguments`);
          return zodConstructor(
            "map",
            args.map((arg) => processType(ctx, arg))
          );
        }
        case "Promise": {
          const args = ty.getTypeArguments();
          if (args.length !== 1)
            throw new Error(`expected one Promise<> type argument`);
          return zodConstructor("promise", [processType(ctx, args[0])]);
        }
        case "Pick": {
          const args = ty.getTypeArguments();
          if (args.length !== 2)
            throw new Error(`expected two Pick<> type arguments`);

          return zodConstructor("promise", [processType(ctx, args[0])]);
        }
      }
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
    return zodConstructor("boolean", [
      // @ts-expect-error not in the types but found in the debugger
      ty.compilerType.intrinsicName === "true"
        ? factory.createTrue()
        : factory.createFalse(),
    ]);
  }
  if (ty.compilerType.flags === ts.TypeFlags.BigIntLiteral) {
    const value = ty.getLiteralValue() as ts.PseudoBigInt;
    return zodConstructor("bigint", [factory.createBigIntLiteral(value)]);
  }
  if (ty.isStringLiteral()) {
    return zodConstructor("string", [
      factory.createStringLiteral(ty.getLiteralValue() as string),
    ]);
  }
  if (ty.isNumberLiteral()) {
    return zodConstructor("number", [
      factory.createNumericLiteral(ty.getLiteralValue() as number),
    ]);
  }
  if (ty.isString()) {
    return zodConstructor("string");
  }
  if (ty.compilerType.flags & ts.TypeFlags.BigInt) {
    return zodConstructor("bigint");
  }
  if (ty.isBoolean()) {
    return zodConstructor("boolean");
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

/** The file in which a type was declared. Likely unsuitable for use for interfaces that might be extended. */
function typeSourceFile(ty: ts.Type): string | undefined {
  return ty.getSymbol()?.declarations?.[0]?.getSourceFile().fileName;
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
      const ty = getTypeOfSymbol(ctx, property);
      return factory.createPropertyAssignment(
        property.getName(),
        processType(ctx, ty)
      );
    })
  );
}

function getTypeOfSymbol(ctx: SchemaGenContext, symbol: tm.Symbol): tm.Type {
  return ctx.typeChecker.getTypeOfSymbolAtLocation(
    symbol,
    symbol.getValueDeclarationOrThrow()
  );
}
