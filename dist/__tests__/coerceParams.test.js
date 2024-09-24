"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const z = __importStar(require("../z"));
const util_1 = require("util");
const coerceParams_1 = __importStar(require("../coerceParams"));
function defaultCoerceTests(schema, cases) {
    describe(schema.description || String(schema), () => {
        for (const [input, expected] of cases) {
            it(`${(0, util_1.inspect)(input)} -> ${(0, util_1.inspect)(expected)}`, () => {
                if (expected instanceof Error) {
                    expect(() => schema.parse(input)).toThrow();
                }
                else {
                    expect(schema.parse(input)).toEqual(expected);
                }
            });
        }
    });
}
defaultCoerceTests(coerceParams_1.defaultCoerceBoolean, [
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
defaultCoerceTests(coerceParams_1.defaultCoerceString, [
    [undefined, undefined],
    ["undefined", "undefined"],
    ["", ""],
    [null, null],
    ["null", "null"],
    ["nil", "nil"],
    [true, new Error()],
    ["true", "true"],
    ["false", "false"],
    [false, new Error()],
    [{}, new Error()],
    [[], new Error()],
]);
defaultCoerceTests(coerceParams_1.defaultCoerceNumber, [
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
defaultCoerceTests(coerceParams_1.defaultCoerceBigInt, [
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
    [-25, -25n],
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
defaultCoerceTests(coerceParams_1.defaultCoerceDate, [
    [undefined, undefined],
    ["undefined", undefined],
    ["", undefined],
    [null, null],
    ["null", null],
    ["nil", null],
    ["2021", new Date("2021")],
    [2021, new Date(2021)],
    ["1609909200", new Date("Jan 6 2021 GMT-0500")],
    [1609909200, new Date(1609909200)],
    ["1609909200000", new Date("Jan 6 2021 GMT-0500")],
    [1609909200000, new Date("Jan 6 2021 GMT-0500")],
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
        expect((0, coerceParams_1.default)(z.date().withMetadata({ foo: "bar" })).parse("2021-03-03")).toEqual(new Date("2021-03-03"));
    });
    it("ZodNumber in ZodArray", function () {
        expect((0, coerceParams_1.default)(z.number().array()).parse(["1", "2", "3"])).toEqual([
            1, 2, 3,
        ]);
    });
    it("ZodNumber in ZodLazy", function () {
        expect((0, coerceParams_1.default)(z.lazy(() => z.number())).parse("123")).toEqual(123);
    });
    it("ZodObject", function () {
        expect((0, coerceParams_1.default)(z
            .object({ a: z.string(), b: z.number(), c: z.boolean() })
            .catchall(z.number())).parse({ a: "123", b: "456", c: "true", d: "789" })).toEqual({ a: "123", b: 456, c: true, d: 789 });
    });
    it("ZodBoolean in ZodCatch", function () {
        expect((0, coerceParams_1.default)(z.boolean().catch(true)).parse("false")).toEqual(false);
        expect((0, coerceParams_1.default)(z.boolean().catch(true)).parse("")).toEqual(undefined);
    });
    it("ZodNumber in ZodBranded", function () {
        expect((0, coerceParams_1.default)(z.number().brand("foo")).parse("123")).toEqual(123);
    });
    it("ZodNumber in ZodSet", function () {
        expect((0, coerceParams_1.default)(z.set(z.number())).parse(new Set(["123"]))).toEqual(new Set([123]));
    });
    it("ZodNumber in ZodDefault", function () {
        expect((0, coerceParams_1.default)(z.number().default(5)).parse("123")).toEqual(123);
        expect((0, coerceParams_1.default)(z.number().default(5)).parse(undefined)).toEqual(5);
    });
    it("ZodNumber in ZodOptional", function () {
        expect((0, coerceParams_1.default)(z.number().optional()).parse("123")).toEqual(123);
        expect((0, coerceParams_1.default)(z.number().optional()).parse(undefined)).toEqual(undefined);
    });
    it("ZodNumber in ZodNullable", function () {
        expect((0, coerceParams_1.default)(z.number().nullable()).parse("123")).toEqual(123);
        expect((0, coerceParams_1.default)(z.number().nullable()).parse(null)).toEqual(null);
    });
    it("ZodNumber in ZodEffects", function () {
        expect((0, coerceParams_1.default)(z.number().transform((x) => x * 2)).parse("123")).toEqual(246);
    });
    it("ZodPipeline", function () {
        expect(() => (0, coerceParams_1.default)(z.string().pipe(z.number())).parse(456)).toThrow();
        expect((0, coerceParams_1.default)(z.number().pipe(z.number().max(5))).parse("5")).toEqual(5);
        expect(() => (0, coerceParams_1.default)(z.number().pipe(z.number().max(5))).parse("6")).toThrow();
    });
    it("ZodMap", function () {
        expect((0, coerceParams_1.default)(z.map(z.number(), z.number())).parse(new Map([["1", "2"]]))).toEqual(new Map([[1, 2]]));
    });
    it("ZodDiscriminatedUnion", function () {
        const schema = (0, coerceParams_1.default)(z.discriminatedUnion("type", [
            z.object({ type: z.literal("a"), a: z.number() }),
            z.object({ type: z.literal("b"), b: z.string() }),
        ]));
        expect(schema.parse({ type: "a", a: "1" })).toEqual({ type: "a", a: 1 });
        expect(schema.parse({ type: "b", b: "2" })).toEqual({ type: "b", b: "2" });
    });
    it("ZodUnion", function () {
        const schema = (0, coerceParams_1.default)(z.union([
            z.object({ type: z.literal("a"), a: z.number() }),
            z.object({ type: z.literal("b"), b: z.string() }),
        ]));
        expect(schema.parse({ type: "a", a: "1" })).toEqual({ type: "a", a: 1 });
        expect(schema.parse({ type: "b", b: "2" })).toEqual({ type: "b", b: "2" });
    });
    it("ZodUnion of ZodLiterals", function () {
        const schema = (0, coerceParams_1.default)(z.union([z.literal(1), z.literal(2), z.literal(3), z.literal("123")]));
        expect(schema.parse(1)).toEqual(1);
        expect(schema.parse("1")).toEqual(1);
        expect(schema.parse("2")).toEqual(2);
        expect(schema.parse("123")).toEqual("123");
        expect(() => schema.parse("4")).toThrow();
        expect(() => schema.parse(4)).toThrow();
    });
    it("ZodIntersection", function () {
        const schema = (0, coerceParams_1.default)(z.intersection(z.object({ a: z.number() }), z.object({ a: z.number(), b: z.string() })));
        expect(schema.parse({ a: "1", b: "5" })).toEqual({ a: 1, b: "5" });
        expect(() => schema.parse({ a: "1" })).toThrow();
    });
    it("ZodRecord", function () {
        const schema = (0, coerceParams_1.default)(z.record(z.string(), z.number()));
        expect(schema.parse({ a: "1", b: "2" })).toEqual({ a: 1, b: 2 });
    });
    it("ZodTuple", function () {
        const schema = (0, coerceParams_1.default)(z.tuple([z.number(), z.string(), z.boolean()]));
        expect(schema.parse(["1", "2", "false"])).toEqual([1, "2", false]);
    });
});
//# sourceMappingURL=coerceParams.test.js.map