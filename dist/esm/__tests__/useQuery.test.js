var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as React from "react";
import { Stl, z } from "stainless";
import { createUseReactQueryClient } from "..";
import { QueryClient, QueryClientProvider, } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
const stl = new Stl({ plugins: {} });
const api = stl.api({
    basePath: "/",
    resources: {
        query: stl.resource({
            summary: "query",
            actions: {
                retrieve: stl.endpoint({
                    endpoint: "GET /query/{foo}",
                    query: z.object({ bar: z.string() }),
                    response: z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
        optionalQuery: stl.resource({
            summary: "optionalQuery",
            actions: {
                retrieve: stl.endpoint({
                    endpoint: "GET /optionalQuery/{foo}",
                    query: z.object({ bar: z.string().optional() }),
                    response: z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
        pathQuery: stl.resource({
            summary: "pathQuery",
            actions: {
                retrieve: stl.endpoint({
                    endpoint: "GET /pathQuery/{foo}",
                    path: z.object({ foo: z.string() }),
                    query: z.object({ bar: z.string() }),
                    response: z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
        pathOptionalQuery: stl.resource({
            summary: "pathOptionalQuery",
            actions: {
                retrieve: stl.endpoint({
                    endpoint: "GET /pathOptionalQuery/{foo}",
                    path: z.object({ foo: z.string() }),
                    query: z.object({ bar: z.string().optional() }),
                    response: z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
    },
});
// fetch mock that just echoes back its arguments
const fetch = (req, init) => __awaiter(void 0, void 0, void 0, function* () {
    return new Response(JSON.stringify({ req, init }));
});
const queryClient = new QueryClient();
const baseUrl = "http://localhost:3000";
const useClient = createUseReactQueryClient(baseUrl, {
    fetch,
});
describe("useQuery methods", () => {
    for (const [description, useQuery, expectedUrl] of [
        [
            "get with required query",
            (client) => client.query.useRetrieve({ bar: "b" }),
            "/query?bar=b",
        ],
        [
            "get with omitted optional query",
            (client) => client.optionalQuery.useRetrieve(),
            "/optionalQuery",
        ],
        [
            "get with optional query",
            (client) => client.optionalQuery.useRetrieve({ bar: "b" }),
            "/optionalQuery?bar=b",
        ],
        [
            "get with path and required query",
            (client) => client.pathQuery.useRetrieve("a", { bar: "b" }),
            "/pathQuery/a?bar=b",
        ],
        [
            "get with path and optional query",
            (client) => client.pathOptionalQuery.useRetrieve("a", { bar: "b" }),
            "/pathOptionalQuery/a?bar=b",
        ],
        [
            "get with path and omitted optional query",
            (client) => client.pathOptionalQuery.useRetrieve("a"),
            "/pathOptionalQuery/a",
        ],
    ]) {
        it(description, () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            let hookResult;
            const Comp = () => {
                hookResult = useQuery(useClient());
                return null;
            };
            render(React.createElement(QueryClientProvider, { client: queryClient },
                React.createElement(Comp, null)));
            yield waitFor(() => expect(hookResult === null || hookResult === void 0 ? void 0 : hookResult.isSuccess).toEqual(true), {
                interval: 500,
                timeout: 10000,
            });
            expect((_a = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _a === void 0 ? void 0 : _a.req).toEqual(`${baseUrl}${expectedUrl}`);
        }), 15000);
    }
});
//# sourceMappingURL=useQuery.test.js.map