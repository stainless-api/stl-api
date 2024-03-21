var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { afterEach, beforeEach, describe, expect, it, vi, } from "vitest";
import { makeClientWithInferredTypes } from "../core/api-client";
import * as ReactQuery from "@tanstack/react-query";
import * as MockAPI from "../test-util/api-server";
describe("react-query extension runtime", () => {
    describe("useQuery", () => {
        let client;
        let mockFetch;
        let mockUseQuery;
        beforeEach(() => {
            mockFetch = vi.fn(MockAPI.mockFetchImplementation);
            mockUseQuery = vi.fn();
            const config = {
                fetch: mockFetch,
                basePath: "/api",
                extensions: { reactQuery: Object.assign(Object.assign({}, ReactQuery), { useQuery: mockUseQuery }) },
            };
            client = makeClientWithInferredTypes(config);
        });
        afterEach(() => {
            vi.restoreAllMocks();
        });
        it("Should send the correct queryFn and queryKey", () => {
            client.cats.list.useQuery();
            expect(mockUseQuery).toBeCalledWith({
                queryFn: expect.any(Function),
                queryKey: ["/api/cats"],
            });
        });
        it("Should not affect non-extension methods", () => __awaiter(void 0, void 0, void 0, function* () {
            const cats = client.cats.useList();
            yield cats.queryFn();
            expect(mockFetch).toBeCalledWith("/api/cats", { method: "GET" });
        }));
    });
});
//# sourceMappingURL=extensions.test.js.map