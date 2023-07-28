import { testCase } from "./testCase";
import { multiFileTestCase } from "./multiFileTestCase";

import { z } from "stainless";

type anyType = any;
it(`any`, () =>
  expect(testCase({ __filename, nodeName: "anyType" })).toMatchInlineSnapshot(
    `"z.any()"`
  ));

type unknownType = unknown;
it(`unknown`, () =>
  expect(
    testCase({ __filename, nodeName: "unknownType" })
  ).toMatchInlineSnapshot(`"z.unknown()"`));

type neverType = never;
it(`never`, () =>
  expect(testCase({ __filename, nodeName: "neverType" })).toMatchInlineSnapshot(
    `"z.never()"`
  ));

type voidType = void;
it(`void`, () =>
  expect(testCase({ __filename, nodeName: "voidType" })).toMatchInlineSnapshot(
    `"z.void()"`
  ));

type nullType = null;
it(`null`, () =>
  expect(testCase({ __filename, nodeName: "nullType" })).toMatchInlineSnapshot(
    `"z.null()"`
  ));

type undefinedType = undefined;
it(`undefined`, () =>
  expect(
    testCase({ __filename, nodeName: "undefinedType" })
  ).toMatchInlineSnapshot(`"z.undefined()"`));

type stringType = string;
it(`string`, () =>
  expect(
    testCase({ __filename, nodeName: "stringType" })
  ).toMatchInlineSnapshot(`"z.string()"`));

type stringLiteralType = "a";
it(`string literal`, () =>
  expect(
    testCase({ __filename, nodeName: "stringLiteralType" })
  ).toMatchInlineSnapshot(`"z.literal("a")"`));

type numberType = number;
it(`number`, () =>
  expect(
    testCase({ __filename, nodeName: "numberType" })
  ).toMatchInlineSnapshot(`"z.number()"`));

type numberLiteralType = "5";
it(`number literal`, () =>
  expect(
    testCase({ __filename, nodeName: "numberLiteralType" })
  ).toMatchInlineSnapshot(`"z.literal("5")"`));

type booleanType = boolean;
it(`boolean`, () =>
  expect(
    testCase({ __filename, nodeName: "booleanType" })
  ).toMatchInlineSnapshot(`"z.boolean()"`));

type trueType = true;
it(`true`, () =>
  expect(testCase({ __filename, nodeName: "trueType" })).toMatchInlineSnapshot(
    `"z.literal(true)"`
  ));

type falseType = false;
it(`false`, () =>
  expect(testCase({ __filename, nodeName: "falseType" })).toMatchInlineSnapshot(
    `"z.literal(false)"`
  ));

type bigintType = bigint;
it(`bigint`, () =>
  expect(
    testCase({ __filename, nodeName: "bigintType" })
  ).toMatchInlineSnapshot(`"z.bigint()"`));

type bigintLiteralType = "5n";
it(`bigint literal`, () =>
  expect(
    testCase({ __filename, nodeName: "bigintLiteralType" })
  ).toMatchInlineSnapshot(`"z.literal("5n")"`));

type arrayNumberType = Array<number>;

it(`Array<number>`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "arrayNumberType",
    })
  ).toMatchInlineSnapshot(`"z.array(z.number())"`));

type basicObjectType = { a: number; b?: string };

it(`{a: number, b?: string}`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "basicObjectType",
    })
  ).toMatchInlineSnapshot(
    `"z.object({ a: z.number(), b: z.string().optional() })"`
  ));

type dateType = Date;

it(`Date`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "dateType",
    })
  ).toMatchInlineSnapshot(`"z.date()"`));

type discriminatedUnionType =
  | { type: "a"; summary: "b" }
  | { type: "b" | "c"; summary: "b" | string };

it(`discriminated union`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "discriminatedUnionType",
    })
  ).toMatchInlineSnapshot(
    `"z.discriminatedUnion("type", [z.object({ type: z.literal("a"), summary: z.literal("b") }), z.object({ type: z.enum(["b", "c"]), summary: z.string() })])"`
  ));

interface interfaceType {
  a: number;
  b?: string;
}

it(`interface T { a: number, b?: string }`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "interfaceType",
    })
  ).toMatchInlineSnapshot(
    `"z.object({ a: z.number(), b: z.string().optional() })"`
  ));

type mapType = Map<string, number>;

it(`Map<string, number>`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "mapType",
    })
  ).toMatchInlineSnapshot(`"z.map(z.string(), z.number())"`));

type mixedRecordType = {
  [k: string]: number;
  [z: symbol]: string;
};

it(`{ [k: string]: number; [z: symbol]: string }`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "mixedRecordType",
    })
  ).toMatchInlineSnapshot(
    `"z.union([z.record(z.symbol(), z.string()), z.record(z.string(), z.number())])"`
  ));

type objIntersectionType = { a: number } & { b: string };

it(`{a: number} & {b: string}`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "objIntersectionType",
    })
  ).toMatchInlineSnapshot(
    `"z.object({ a: z.number() }).and(z.object({ b: z.string() }))"`
  ));

type promiseStringType = Promise<string>;

it(`Promise<string>`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "promiseStringType",
    })
  ).toMatchInlineSnapshot(`"z.promise(z.string())"`));

type readonlyNumberArrayType1 = readonly number[];

it(`readonly number[]`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "readonlyNumberArrayType1",
    })
  ).toMatchInlineSnapshot(`"z.array(z.number())"`));

type readonlyNumberArrayType2 = ReadonlyArray<number>;

it(`ReadonlyArray<number>`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "readonlyNumberArrayType2",
    })
  ).toMatchInlineSnapshot(`"z.array(z.number())"`));

type record1 = { [k: string | number]: number };

it(`{[k: string | number]: number}`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "record1",
    })
  ).toMatchInlineSnapshot(
    `"z.record(z.union([z.string(), z.number()]), z.number())"`
  ));

type record2 = { [k: string]: number };

it(`{[k: string]: number}`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "record2",
    })
  ).toMatchInlineSnapshot(`"z.record(z.string(), z.number())"`));

type recursiveType = number | [recursiveType];

it(`number | [T]`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "recursiveType",
    })
  ).toMatchInlineSnapshot(
    `"z.union([z.number(), z.tuple([z.lazy(() => recursiveType)])])"`
  ));

type enumType = "a" | "b";

it(`'a' | 'b'`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "enumType",
    })
  ).toMatchInlineSnapshot(`"z.enum(["a", "b"])"`));

type setStringType = Set<string>;

it(`Set<string>`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "setStringType",
    })
  ).toMatchInlineSnapshot(`"z.set(z.string())"`));

type tupleType = [string, number];

it(`[string, number]`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "tupleType",
    })
  ).toMatchInlineSnapshot(`"z.tuple([z.string(), z.number()])"`));

type variadicTupleType = [number, ...string[]];

it(`[number, ...string[]]`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "variadicTupleType",
    })
  ).toMatchInlineSnapshot(`"z.tuple([z.number()]).rest(z.string())"`));

type Foo = "a" | "b";
type Bar = "c" | "d";

type unionNestedTypeAliasesType = Foo | Bar | null;

it(`Foo | Bar | null`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "unionNestedTypeAliasesType",
    })
  ).toMatchInlineSnapshot(
    `"z.union([z.lazy(() => Foo), z.lazy(() => Bar)]).nullable()"`
  ));

type unionStringNumberNullType = string | number | null;

it(`string | number | null`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "unionStringNumberNullType",
    })
  ).toMatchInlineSnapshot(`"z.union([z.string(), z.number()]).nullable()"`));

type unionStringNumberNullUndefinedType = string | number | null | undefined;

it(`string | number | null | undefined`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "unionStringNumberNullUndefinedType",
    })
  ).toMatchInlineSnapshot(
    `"z.union([z.string(), z.number()]).nullable().optional()"`
  ));

type unionStringNumberUndefinedType = string | number | undefined;

it(`string | number | undefined`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "unionStringNumberUndefinedType",
    })
  ).toMatchInlineSnapshot(`"z.union([z.string(), z.number()]).optional()"`));

type unionStringNumberType = string | number;

it(`string | number`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "unionStringNumberType",
    })
  ).toMatchInlineSnapshot(`"z.union([z.string(), z.number()])"`));

type Obj<X> = {
  a: X;
  b?: "x";
};
type mappedType = {
  [k in keyof Obj<number>]: NonNullable<Obj<number>[k]> extends string
    ? { string: NonNullable<Obj<number>[k]> }
    : { other: NonNullable<Obj<number>[k]> };
};

it(`mapped type`, () =>
  expect(
    testCase({
      __filename,
      nodeName: "mappedType",
    })
  ).toMatchInlineSnapshot(
    `"z.object({ a: z.object({ other: z.number() }), b: z.object({ string: z.literal("x") }).optional() })"`
  ));

export const objectSchema = z.object({ a: z.string() });

type zodSchemaProperty = {
  zod: z.ZodSchema<{ schema: typeof objectSchema }>;
};

it(`zod schema property`, async () =>
  expect(
    await multiFileTestCase({
      __filename,
      getNode: (sourceFile) => sourceFile.getTypeAlias("zodSchemaProperty"),
    })
  ).toMatchInlineSnapshot(`
{
  "src/__tests__/basics.test.codegen.ts": "import { z } from "zod";
import * as BasicsTest from "./basics.test";
const zodSchemaProperty: z.ZodTypeAny = z.object({ zod: z.lazy(() => BasicsTest.objectSchema) });
",
}
`));

export class TransformSchema extends z.Schema<string, number> {
  transform(value: number): string {
    return String(value);
  }
}

it(`schema with transform`, async () =>
  expect(
    await multiFileTestCase({
      __filename,
      getNode: (sourceFile) => sourceFile.getClass("TransformSchema"),
    })
  ).toMatchInlineSnapshot(`
{
  "src/__tests__/basics.test.codegen.ts": "import { z } from "zod";
import * as BasicsTest from "./basics.test";
export const TransformSchema: z.ZodTypeAny = z.number().stlTransform(new BasicsTest.TransformSchema().transform);
",
}
`));

export class ValidateSchema extends z.Schema<string> {
  validate(input: string): boolean {
    return input.length % 2 === 0;
  }
}

it(`schema with transform`, async () =>
  expect(
    await multiFileTestCase({
      __filename,
      getNode: (sourceFile) => sourceFile.getClass("ValidateSchema"),
    })
  ).toMatchInlineSnapshot(`
{
  "src/__tests__/basics.test.codegen.ts": "import { z } from "zod";
import * as BasicsTest from "./basics.test";
export const ValidateSchema: z.ZodTypeAny = z.string().refine(new BasicsTest.ValidateSchema().validate);
",
}
`));

export class ValidateTransformSchema extends z.Schema<string, number> {
  validate(input: number): boolean {
    return input % 2 === 0;
  }

  transform(input: number): string {
    return String(input);
  }
}

it(`schema with validate, transform`, async () =>
  expect(
    await multiFileTestCase({
      __filename,
      getNode: (sourceFile) => sourceFile.getClass("ValidateTransformSchema"),
    })
  ).toMatchInlineSnapshot(`
{
  "src/__tests__/basics.test.codegen.ts": "import { z } from "zod";
import * as BasicsTest from "./basics.test";
export const ValidateTransformSchema: z.ZodTypeAny = z.number().refine(new BasicsTest.ValidateTransformSchema().validate).stlTransform(new BasicsTest.ValidateTransformSchema().transform);
",
}
`));
