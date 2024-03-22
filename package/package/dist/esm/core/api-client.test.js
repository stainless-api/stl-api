var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeClientWithInferredTypes } from "./api-client";
import * as MockAPI from "../test-util/api-server";
describe("API Client", () => {
    describe("configuration options", () => {
        let client;
        let mockFetch;
        beforeEach(() => {
            mockFetch = vi.fn(MockAPI.mockFetchImplementation);
            const config = {
                fetch: mockFetch,
                basePath: "/api",
                urlCase: "camel",
            };
            client = makeClientWithInferredTypes(config);
        });
        afterEach(() => {
            vi.restoreAllMocks();
        });
        it("can preserve camel casing", () => __awaiter(void 0, void 0, void 0, function* () {
            const treat = yield client.dogs("fido").dogTreats.list();
            expect(mockFetch).toHaveBeenCalledWith("/api/dogs/fido/dogTreats", {
                method: "GET",
            });
            expect(treat).toStrictEqual([{ yummy: true }]);
        }));
    });
    describe("fetch calls", () => {
        let client;
        let mockFetch;
        beforeEach(() => {
            mockFetch = vi.fn(MockAPI.mockFetchImplementation);
            const config = { fetch: mockFetch, basePath: "/api" };
            client = makeClientWithInferredTypes(config);
        });
        afterEach(() => {
            vi.restoreAllMocks();
        });
        it("can make fetch calls", () => __awaiter(void 0, void 0, void 0, function* () {
            const cats = yield client.cats.list();
            expect(mockFetch).toHaveBeenCalledWith("/api/cats", { method: "GET" });
            expect(cats).toStrictEqual([{ name: "Shiro", color: "black" }]);
        }));
        it("can send a request body", () => __awaiter(void 0, void 0, void 0, function* () {
            const update = yield client
                .cats("shiro")
                .update({ name: "Shiro!" });
            expect(update).toStrictEqual({ name: "Shiro!", color: "black" });
            expect(mockFetch).toHaveBeenCalledWith("/api/cats/shiro", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: "Shiro!" }),
            });
        }));
        it("can handle API errors", () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(() => __awaiter(void 0, void 0, void 0, function* () { return yield client.dogs.list(); })).rejects.toThrowError("Expected to throw");
        }));
        it("can handle case changes", () => __awaiter(void 0, void 0, void 0, function* () {
            const treat = yield client.dogs("fido").dogTreats.list();
            expect(mockFetch).toHaveBeenCalledWith("/api/dogs/fido/dog-treats", {
                method: "GET",
            });
            expect(treat).toStrictEqual([{ yummy: true }]);
        }));
    });
    describe("react hook calls", () => {
        let client;
        let mockFetch;
        beforeEach(() => {
            mockFetch = vi
                .fn(fetch)
                .mockImplementation(MockAPI.mockFetchImplementation);
            const config = { fetch: mockFetch, basePath: "/api" };
            client = makeClientWithInferredTypes(config);
        });
        afterEach(() => {
            vi.restoreAllMocks();
        });
        it("can make fetch calls", () => __awaiter(void 0, void 0, void 0, function* () {
            const { queryFn, queryKey } = client.cats.useList();
            expect(queryKey).toEqual(["/api/cats"]);
            expect(queryFn).toBeTypeOf("function");
            const cats = yield queryFn();
            expect(mockFetch).toHaveBeenCalledWith("/api/cats", { method: "GET" });
            expect(cats).toStrictEqual([{ name: "Shiro", color: "black" }]);
        }));
        it("can send a request body", () => __awaiter(void 0, void 0, void 0, function* () {
            const { queryFn, queryKey } = client
                .cats("shiro")
                .useUpdate({ name: "Shiro!" });
            expect(queryKey).toEqual(["/api/cats/shiro"]);
            expect(queryFn).toBeTypeOf("function");
            const update = yield queryFn();
            expect(mockFetch).toHaveBeenCalledWith("/api/cats/shiro", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: "Shiro!" }),
            });
            expect(update).toStrictEqual({ name: "Shiro!", color: "black" });
        }));
        it("Can tell user apart from useX", () => __awaiter(void 0, void 0, void 0, function* () {
            const { queryFn, queryKey } = client.users("asdf").useUpdate({});
            expect(queryKey).toEqual(["/api/users/asdf"]);
            expect(queryFn).toBeTypeOf("function");
        }));
    });
});
//# sourceMappingURL=api-client.test.js.map