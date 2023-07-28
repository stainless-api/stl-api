import { z } from "../stl";
import coerceParams from "../coerceParams";

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
    expect(coerceParams(z.boolean().catch(true)).parse("")).toEqual(false);
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
    expect(coerceParams(z.string().pipe(z.boolean())).parse(456)).toEqual(true);
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
