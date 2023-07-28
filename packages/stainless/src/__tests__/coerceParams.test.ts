import * as z from "../z";
import { inspect } from "util";
import coerceParams, {
  defaultCoerceBoolean,
  defaultCoerceNumber,
  defaultCoerceString,
  defaultCoerceBigInt,
  defaultCoerceDate,
} from "../coerceParams";

function defaultCoerceTests<T extends z.ZodTypeAny>(
  schema: T,
  cases: [any, z.output<T> | Error][]
) {
  describe(schema.description || String(schema), () => {
    for (const [input, expected] of cases) {
      it(`${inspect(input)} -> ${inspect(expected)}`, () => {
        if (expected instanceof Error) {
          expect(() => schema.parse(input)).toThrow();
        } else {
          expect(schema.parse(input)).toEqual(expected);
        }
      });
    }
  });
}

defaultCoerceTests(defaultCoerceBoolean, [
  [undefined, undefined],
  ["undefined", undefined],
  ["", undefined],
  [null, null],
  ["null", null],
  ["nil", null],
  [true, true],
  ["true", true],
  ["false", false],
  [false, false],
  [0, new Error()],
  [1, new Error()],
  ["a", new Error()],
  [{}, new Error()],
  [[], new Error()],
]);

defaultCoerceTests(defaultCoerceString, [
  [undefined, undefined],
  ["undefined", "undefined"],
  ["", ""],
  [null, null],
  ["null", "null"],
  ["nil", "nil"],
  [true, "true"],
  ["true", "true"],
  ["false", "false"],
  [false, "false"],
  [{}, new Error()],
  [[], new Error()],
]);

defaultCoerceTests(defaultCoerceNumber, [
  [undefined, undefined],
  ["undefined", undefined],
  ["", undefined],
  [null, null],
  ["null", null],
  ["nil", null],
  [true, 1],
  ["true", new Error()],
  ["false", new Error()],
  [false, 0],
  [2.5, 2.5],
  ["2.5", 2.5],
  ["-2.3e-6", -2.3e-6],
  ["Infinity", Infinity],
  [Infinity, Infinity],
  ["-Infinity", -Infinity],
  [-Infinity, -Infinity],
  ["NaN", new Error()],
  [NaN, new Error()],
  ["1a", new Error()],
  ["-", new Error()],
  [{}, new Error()],
  [[], new Error()],
]);

defaultCoerceTests(defaultCoerceBigInt, [
  [undefined, undefined],
  ["undefined", undefined],
  ["", undefined],
  [null, null],
  ["null", null],
  ["nil", null],
  // @ts-ignore
  [true, 1n],
  ["true", new Error()],
  ["false", new Error()],
  // @ts-ignore
  [false, 0n],
  // @ts-ignore
  [25, 25n],
  // @ts-ignore
  ["25", 25n],
  ["2.6", new Error()],
  ["Infinity", new Error()],
  [Infinity, new Error()],
  ["-Infinity", new Error()],
  [-Infinity, new Error()],
  ["NaN", new Error()],
  [NaN, new Error()],
  ["1a", new Error()],
  ["-", new Error()],
  [{}, new Error()],
  [[], new Error()],
]);

defaultCoerceTests(defaultCoerceDate, [
  [undefined, undefined],
  ["undefined", undefined],
  ["", undefined],
  [null, null],
  ["null", null],
  ["nil", null],
  ["2021", new Date("2021")],
  [2021, new Date(2021)],
  ["1609909200", new Date("Jan 6 2021")],
  [1609909200, new Date(1609909200)],
  ["1609909200000", new Date("Jan 6 2021")],
  [1609909200000, new Date("Jan 6 2021")],
  ["Jan 6 2021", new Date("Jan 6 2021")],
  [new Date("Jan 6 2021"), new Date("Jan 6 2021")],
  ["Jan", new Error()],
  ["a", new Error()],
  [true, new Error()],
  [false, new Error()],
  [{}, new Error()],
  [[], new Error()],
]);

describe("coerceParams", () => {
  it("ZodDate with ZodMetadata", () => {
    expect(
      coerceParams(z.date().withMetadata({ foo: "bar" })).parse("2021-03-03")
    ).toEqual(new Date("2021-03-03"));
  });
  it("ZodString in ZodArray", function () {
    expect(coerceParams(z.string().array()).parse([1, 2, 3])).toEqual([
      "1",
      "2",
      "3",
    ]);
  });
  it("ZodNumber in ZodLazy", function () {
    expect(coerceParams(z.lazy(() => z.number())).parse("123")).toEqual(123);
  });
  it("ZodObject", function () {
    expect(
      coerceParams(
        z
          .object({ a: z.string(), b: z.number(), c: z.boolean() })
          .catchall(z.string())
      ).parse({ a: 123, b: "456", c: "true", d: true })
    ).toEqual({ a: "123", b: 456, c: true, d: "true" });
  });
  it("ZodBoolean in ZodCatch", function () {
    expect(coerceParams(z.boolean().catch(true)).parse("false")).toEqual(false);
    expect(coerceParams(z.boolean().catch(true)).parse("")).toEqual(undefined);
  });
  it("ZodNumber in ZodBranded", function () {
    expect(coerceParams(z.number().brand("foo")).parse("123")).toEqual(123);
  });
  it("ZodNumber in ZodSet", function () {
    expect(coerceParams(z.set(z.number())).parse(new Set(["123"]))).toEqual(
      new Set([123])
    );
  });
  it("ZodNumber in ZodDefault", function () {
    expect(coerceParams(z.number().default(5)).parse("123")).toEqual(123);
    expect(coerceParams(z.number().default(5)).parse(undefined)).toEqual(5);
  });
  it("ZodNumber in ZodOptional", function () {
    expect(coerceParams(z.number().optional()).parse("123")).toEqual(123);
    expect(coerceParams(z.number().optional()).parse(undefined)).toEqual(
      undefined
    );
  });
  it("ZodNumber in ZodNullable", function () {
    expect(coerceParams(z.number().nullable()).parse("123")).toEqual(123);
    expect(coerceParams(z.number().nullable()).parse(null)).toEqual(null);
  });
  it("ZodNumber in ZodEffects", function () {
    expect(
      coerceParams(z.number().transform((x) => x * 2)).parse("123")
    ).toEqual(246);
  });
  it("ZodPipeline", function () {
    expect(() =>
      coerceParams(z.string().pipe(z.number())).parse(456)
    ).toThrow();
    expect(coerceParams(z.number().pipe(z.number().max(5))).parse("5")).toEqual(
      5
    );
    expect(() =>
      coerceParams(z.number().pipe(z.number().max(5))).parse("6")
    ).toThrow();
  });
  it("ZodMap", function () {
    expect(
      coerceParams(z.map(z.string(), z.number())).parse(new Map([[1, "2"]]))
    ).toEqual(new Map([["1", 2]]));
  });
  it("ZodDiscriminatedUnion", function () {
    const schema = coerceParams(
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("a"), a: z.number() }),
        z.object({ type: z.literal("b"), b: z.string() }),
      ])
    );
    expect(schema.parse({ type: "a", a: "1" })).toEqual({ type: "a", a: 1 });
    expect(schema.parse({ type: "b", b: 2 })).toEqual({ type: "b", b: "2" });
  });
  it("ZodUnion", function () {
    const schema = coerceParams(
      z.union([
        z.object({ type: z.literal("a"), a: z.number() }),
        z.object({ type: z.literal("b"), b: z.string() }),
      ])
    );
    expect(schema.parse({ type: "a", a: "1" })).toEqual({ type: "a", a: 1 });
    expect(schema.parse({ type: "b", b: 2 })).toEqual({ type: "b", b: "2" });
  });
  it("ZodUnion of ZodLiterals", function () {
    const schema = coerceParams(
      z.union([z.literal(1), z.literal(2), z.literal(3), z.literal("123")])
    );
    expect(schema.parse(1)).toEqual(1);
    expect(schema.parse("1")).toEqual(1);
    expect(schema.parse("2")).toEqual(2);
    expect(schema.parse(123)).toEqual("123");
    expect(() => schema.parse("4")).toThrow();
    expect(() => schema.parse(4)).toThrow();
  });
  it("ZodIntersection", function () {
    const schema = coerceParams(
      z.intersection(
        z.object({ a: z.number() }),
        z.object({ a: z.number(), b: z.string() })
      )
    );
    expect(schema.parse({ a: "1", b: 5 })).toEqual({ a: 1, b: "5" });
    expect(() => schema.parse({ a: "1" })).toThrow();
  });
  it("ZodRecord", function () {
    const schema = coerceParams(z.record(z.string(), z.number()));
    expect(schema.parse({ a: "1", b: "2" })).toEqual({ a: 1, b: 2 });
  });
  it("ZodTuple", function () {
    const schema = coerceParams(z.tuple([z.number(), z.string()]));
    expect(schema.parse(["1", 2])).toEqual([1, "2"]);
  });
});
