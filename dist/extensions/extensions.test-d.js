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
const cat_api_1 = require("../test-util/cat-api");
const dog_api_1 = require("../test-util/dog-api");
const dog_treat_api_1 = require("../test-util/dog-treat-api");
const stainless_1 = require("stainless");
const api_client_1 = require("../core/api-client");
const stl = new stainless_1.Stl({ plugins: {} });
(0, vitest_1.describe)("Client extensions", () => {
    (0, vitest_1.describe)("react-query", () => {
        const api = stl.api({
            basePath: "/api",
            resources: {
                cats: cat_api_1.cats,
                dogs: dog_api_1.dogs,
                dogTreats: dog_treat_api_1.dogTreats,
            },
        });
        const config = {
            basePath: "/api",
            extensions: { reactQuery: {} },
        };
        const client = (0, api_client_1.makeClient)(config);
        (0, vitest_1.test)("adds useQuery method", () => {
            const cats = client.cats.list.useQuery();
            (0, vitest_1.expectTypeOf)(cats.data).toEqualTypeOf();
        });
        (0, vitest_1.test)("adds useSuspenseQuery method", () => {
            const cats = client.cats.list.useSuspenseQuery();
            (0, vitest_1.expectTypeOf)(cats.data).toEqualTypeOf();
        });
        (0, vitest_1.test)("adds useMutation method", () => {
            const mutation = client.cats("shiro").update.useMutation();
            (0, vitest_1.expectTypeOf)(mutation.mutate).toBeCallableWith({
                name: "string",
                color: "string",
            });
            (0, vitest_1.expectTypeOf)(mutation.mutateAsync).toBeCallableWith({
                name: "string",
                color: "string",
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
//# sourceMappingURL=extensions.test-d.js.map