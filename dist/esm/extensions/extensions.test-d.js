var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { describe, expectTypeOf, test } from "vitest";
import { cats } from "../test-util/cat-api";
import { dogs } from "../test-util/dog-api";
import { dogTreats } from "../test-util/dog-treat-api";
import { Stl } from "stainless";
import { makeClient } from "../core/api-client";
const stl = new Stl({ plugins: {} });
describe("Client extensions", () => {
    describe("react-query", () => {
        const api = stl.api({
            basePath: "/api",
            resources: {
                cats,
                dogs,
                dogTreats,
            },
        });
        const config = {
            basePath: "/api",
            extensions: { reactQuery: {} },
        };
        const client = makeClient(config);
        test("adds useQuery method", () => {
            const cats = client.cats.list.useQuery();
            expectTypeOf(cats.data).toEqualTypeOf();
        });
        test("adds useSuspenseQuery method", () => {
            const cats = client.cats.list.useSuspenseQuery();
            expectTypeOf(cats.data).toEqualTypeOf();
        });
        test("adds useMutation method", () => {
            const mutation = client.cats("shiro").update.useMutation();
            expectTypeOf(mutation.mutate).toBeCallableWith({
                name: "string",
                color: "string",
            });
            expectTypeOf(mutation.mutateAsync).toBeCallableWith({
                name: "string",
                color: "string",
            });
        });
        test("adds getQueryKey method", () => {
            const queryKey = client.cats.list.getQueryKey();
            expectTypeOf(queryKey).toEqualTypeOf();
        });
        test("keeps non react-query methods", () => __awaiter(void 0, void 0, void 0, function* () {
            let cats = yield client.cats.list();
            expectTypeOf(cats).toEqualTypeOf();
            cats = yield client.cats.useList().queryFn();
            expectTypeOf(cats).toEqualTypeOf();
        }));
    });
});
//# sourceMappingURL=extensions.test-d.js.map