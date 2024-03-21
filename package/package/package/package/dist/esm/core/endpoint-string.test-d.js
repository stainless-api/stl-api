import { assertType, describe, expectTypeOf, test } from "vitest";
const wellFormedEndpoint = "GET /foo/bar/{baz}/{foo}/bar/{baz}";
describe("Endpoint string", () => {
    describe("definition", () => {
        test("can check if well formed", () => {
            assertType(wellFormedEndpoint);
            // @ts-expect-error missing path
            assertType("GET");
            // @ts-expect-error missing leading slash
            assertType("GET foo/bar");
            // @ts-expect-error missing method
            assertType("/foo/bar");
        });
    });
    describe("parsing method and path", () => {
        test("can extract the http method", () => {
            expectTypeOf().toMatchTypeOf();
            expectTypeOf().toEqualTypeOf();
            expectTypeOf().toEqualTypeOf();
            expectTypeOf().toEqualTypeOf();
            expectTypeOf().toEqualTypeOf();
            expectTypeOf().toEqualTypeOf();
            expectTypeOf().toEqualTypeOf();
        });
        test("can extract the path", () => {
            expectTypeOf().toEqualTypeOf();
        });
    });
    describe("splitting path into parts", () => {
        test("can split the path into an ordered list of resources and params", () => {
            expectTypeOf().toEqualTypeOf;
        });
        test("Ignores HTTP verbs", () => {
            expectTypeOf().toEqualTypeOf;
        });
        test("can handle a single resource", () => {
            expectTypeOf().toEqualTypeOf;
        });
        test("can handle a single param", () => {
            expectTypeOf().toEqualTypeOf;
        });
        test("can handle sequential params", () => {
            expectTypeOf().toEqualTypeOf;
        });
    });
    describe("Filtering paths", () => {
        test("can filter out path parts", () => {
            expectTypeOf().toEqualTypeOf;
        });
    });
});
//# sourceMappingURL=endpoint-string.test-d.js.map