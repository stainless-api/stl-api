"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const stainless_1 = require("stainless");
const generated_api_types_1 = require("../test-util/generated-api-types");
const stl = new stainless_1.Stl({ plugins: {} });
(0, vitest_1.describe)("Client extensions", () => {
    (0, vitest_1.describe)("react-query", () => {
        const config = {
            basePath: "/api",
            extensions: { reactQuery: {} },
        };
        const client = (0, generated_api_types_1.makeClient)(config);
        (0, vitest_1.test)("adds useQuery method", () => {
            const cats = client.cats.list({ color: "black" }).useQuery();
            (0, vitest_1.expectTypeOf)(cats.data).toEqualTypeOf();
        });
        (0, vitest_1.test)("handles query params", () => {
            const cats = client.cats.list({ color: "black" }).useQuery();
            (0, vitest_1.expectTypeOf)(cats.data).toEqualTypeOf();
        });
        (0, vitest_1.test)("adds useSuspenseQuery method", () => {
            const cats = client.cats.list({ color: "black" }).useSuspenseQuery();
            (0, vitest_1.expectTypeOf)(cats.data).toEqualTypeOf();
        });
        (0, vitest_1.test)("adds useMutation method", () => {
            const mutation = client.cats("shiro").update.useMutation();
            (0, vitest_1.expectTypeOf)(mutation.mutate).toBeCallableWith({
                name: "string",
                color: "black",
            });
            (0, vitest_1.expectTypeOf)(mutation.mutateAsync).toBeCallableWith({
                name: "string",
                color: "blue",
            });
        });
        (0, vitest_1.test)("has correct mutation option types", () => {
            (0, vitest_1.expectTypeOf)(client.cats("shiro").update.useMutation).toBeCallableWith({
                onSuccess({ name, color }) {
                    return { name, color };
                },
            });
        });
        (0, vitest_1.test)("adds getQueryKey method", () => {
            const queryKey = client.cats.list.getQueryKey();
            (0, vitest_1.expectTypeOf)(queryKey).toEqualTypeOf();
        });
        (0, vitest_1.test)("keeps non react-query methods", () => __awaiter(void 0, void 0, void 0, function* () {
            let cats = yield client.cats.list();
            (0, vitest_1.expectTypeOf)(cats).toEqualTypeOf();
            cats = yield client.cats.useList().queryFn();
            (0, vitest_1.expectTypeOf)(cats).toEqualTypeOf();
        }));
    });
});
//# sourceMappingURL=extensions.generated.test-d.js.map