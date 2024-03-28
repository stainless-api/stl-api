"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const wellFormedEndpoint = "GET /foo/bar/{baz}/{foo}/bar/{baz}";
(0, vitest_1.describe)("Endpoint string", () => {
    (0, vitest_1.describe)("definition", () => {
        (0, vitest_1.test)("can check if well formed", () => {
            (0, vitest_1.assertType)(wellFormedEndpoint);
            // @ts-expect-error missing path
            (0, vitest_1.assertType)("GET");
            // @ts-expect-error missing leading slash
            (0, vitest_1.assertType)("GET foo/bar");
            // @ts-expect-error missing method
            (0, vitest_1.assertType)("/foo/bar");
        });
    });
    (0, vitest_1.describe)("parsing method and path", () => {
        (0, vitest_1.test)("can extract the http method", () => {
            (0, vitest_1.expectTypeOf)().toMatchTypeOf();
            (0, vitest_1.expectTypeOf)().toEqualTypeOf();
            (0, vitest_1.expectTypeOf)().toEqualTypeOf();
            (0, vitest_1.expectTypeOf)().toEqualTypeOf();
            (0, vitest_1.expectTypeOf)().toEqualTypeOf();
            (0, vitest_1.expectTypeOf)().toEqualTypeOf();
            (0, vitest_1.expectTypeOf)().toEqualTypeOf();
        });
        (0, vitest_1.test)("can extract the path", () => {
            (0, vitest_1.expectTypeOf)().toEqualTypeOf();
        });
    });
    (0, vitest_1.describe)("splitting path into parts", () => {
        (0, vitest_1.test)("can split the path into an ordered list of resources and params", () => {
            (0, vitest_1.expectTypeOf)().toEqualTypeOf;
        });
        (0, vitest_1.test)("Ignores HTTP verbs", () => {
            (0, vitest_1.expectTypeOf)().toEqualTypeOf;
        });
        (0, vitest_1.test)("can handle a single resource", () => {
            (0, vitest_1.expectTypeOf)().toEqualTypeOf;
        });
        (0, vitest_1.test)("can handle a single param", () => {
            (0, vitest_1.expectTypeOf)().toEqualTypeOf;
        });
        (0, vitest_1.test)("can handle sequential params", () => {
            (0, vitest_1.expectTypeOf)().toEqualTypeOf;
        });
    });
    (0, vitest_1.describe)("Filtering paths", () => {
        (0, vitest_1.test)("can filter out path parts", () => {
            (0, vitest_1.expectTypeOf)().toEqualTypeOf;
        });
    });
});
//# sourceMappingURL=endpoint-string.test-d.js.map