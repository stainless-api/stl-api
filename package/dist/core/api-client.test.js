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
const api_client_1 = require("./api-client");
const MockAPI = __importStar(require("../test-util/api-server"));
(0, vitest_1.describe)("API Client", () => {
    (0, vitest_1.describe)("configuration options", () => {
        let client;
        let mockFetch;
        (0, vitest_1.beforeEach)(() => {
            mockFetch = vitest_1.vi.fn(MockAPI.mockFetchImplementation);
            const config = {
                fetch: mockFetch,
                basePath: "/api",
                urlCase: "camel",
            };
            client = (0, api_client_1.makeClientWithInferredTypes)(config);
        });
        (0, vitest_1.afterEach)(() => {
            vitest_1.vi.restoreAllMocks();
        });
        (0, vitest_1.it)("can preserve camel casing", () => __awaiter(void 0, void 0, void 0, function* () {
            const treat = yield client.dogs("fido").dogTreats.list();
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("/api/dogs/fido/dogTreats", {
                method: "GET",
            });
            (0, vitest_1.expect)(treat).toStrictEqual([{ yummy: true }]);
        }));
    });
    (0, vitest_1.describe)("fetch calls", () => {
        let client;
        let mockFetch;
        (0, vitest_1.beforeEach)(() => {
            mockFetch = vitest_1.vi.fn(MockAPI.mockFetchImplementation);
            const config = { fetch: mockFetch, basePath: "/api" };
            client = (0, api_client_1.makeClientWithInferredTypes)(config);
        });
        (0, vitest_1.afterEach)(() => {
            vitest_1.vi.restoreAllMocks();
        });
        (0, vitest_1.it)("can make fetch calls", () => __awaiter(void 0, void 0, void 0, function* () {
            const cats = yield client.cats.list();
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("/api/cats", { method: "GET" });
            (0, vitest_1.expect)(cats).toStrictEqual([{ name: "Shiro", color: "black" }]);
        }));
        (0, vitest_1.it)("can send a request body", () => __awaiter(void 0, void 0, void 0, function* () {
            const update = yield client
                .cats("shiro")
                .update({ name: "Shiro!" });
            (0, vitest_1.expect)(update).toStrictEqual({ name: "Shiro!", color: "black" });
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("/api/cats/shiro", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: "Shiro!" }),
            });
        }));
        (0, vitest_1.it)("can handle API errors", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, vitest_1.expect)(() => __awaiter(void 0, void 0, void 0, function* () { return yield client.dogs.list(); })).rejects.toThrowError("Expected to throw");
        }));
        (0, vitest_1.it)("can handle case changes", () => __awaiter(void 0, void 0, void 0, function* () {
            const treat = yield client.dogs("fido").dogTreats.list();
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("/api/dogs/fido/dog-treats", {
                method: "GET",
            });
            (0, vitest_1.expect)(treat).toStrictEqual([{ yummy: true }]);
        }));
    });
    (0, vitest_1.describe)("react hook calls", () => {
        let client;
        let mockFetch;
        (0, vitest_1.beforeEach)(() => {
            mockFetch = vitest_1.vi
                .fn(fetch)
                .mockImplementation(MockAPI.mockFetchImplementation);
            const config = { fetch: mockFetch, basePath: "/api" };
            client = (0, api_client_1.makeClientWithInferredTypes)(config);
        });
        (0, vitest_1.afterEach)(() => {
            vitest_1.vi.restoreAllMocks();
        });
        (0, vitest_1.it)("can make fetch calls", () => __awaiter(void 0, void 0, void 0, function* () {
            const { queryFn, queryKey } = client.cats.useList();
            (0, vitest_1.expect)(queryKey).toEqual(["/api/cats"]);
            (0, vitest_1.expect)(queryFn).toBeTypeOf("function");
            const cats = yield queryFn();
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("/api/cats", { method: "GET" });
            (0, vitest_1.expect)(cats).toStrictEqual([{ name: "Shiro", color: "black" }]);
        }));
        (0, vitest_1.it)("can send a request body", () => __awaiter(void 0, void 0, void 0, function* () {
            const { queryFn, queryKey } = client
                .cats("shiro")
                .useUpdate({ name: "Shiro!" });
            (0, vitest_1.expect)(queryKey).toEqual(["/api/cats/shiro"]);
            (0, vitest_1.expect)(queryFn).toBeTypeOf("function");
            const update = yield queryFn();
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("/api/cats/shiro", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: "Shiro!" }),
            });
            (0, vitest_1.expect)(update).toStrictEqual({ name: "Shiro!", color: "black" });
        }));
        (0, vitest_1.it)("Can tell user apart from useX", () => __awaiter(void 0, void 0, void 0, function* () {
            const { queryFn, queryKey } = client.users("asdf").useUpdate({});
            (0, vitest_1.expect)(queryKey).toEqual(["/api/users/asdf"]);
            (0, vitest_1.expect)(queryFn).toBeTypeOf("function");
        }));
    });
});
//# sourceMappingURL=api-client.test.js.map