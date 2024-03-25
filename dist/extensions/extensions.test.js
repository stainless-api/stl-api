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
const api_client_1 = require("../core/api-client");
const ReactQuery = __importStar(require("@tanstack/react-query"));
const MockAPI = __importStar(require("../test-util/api-server"));
function mockUseQueryImplementation({ queryFn, }) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield queryFn();
    });
}
(0, vitest_1.describe)("react-query extension runtime", () => {
    (0, vitest_1.describe)("useQuery", () => {
        let client;
        let mockFetch;
        let mockUseQuery;
        (0, vitest_1.beforeEach)(() => {
            mockFetch = vitest_1.vi.fn(MockAPI.mockFetchImplementation);
            mockUseQuery = vitest_1.vi
                .fn()
                .mockImplementation(mockUseQueryImplementation);
            const config = {
                fetch: mockFetch,
                basePath: "/api",
                extensions: { reactQuery: Object.assign(Object.assign({}, ReactQuery), { useQuery: mockUseQuery }) },
            };
            client = (0, api_client_1.makeClientWithInferredTypes)(config);
        });
        (0, vitest_1.afterEach)(() => {
            vitest_1.vi.restoreAllMocks();
        });
        (0, vitest_1.it)("Should send the correct queryFn and queryKey", () => {
            client.cats.list.useQuery();
            (0, vitest_1.expect)(mockUseQuery).toBeCalledWith({
                queryFn: vitest_1.expect.any(Function),
                queryKey: ["/api/cats"],
            });
        });
        (0, vitest_1.it)("Should not affect non-extension methods", () => __awaiter(void 0, void 0, void 0, function* () {
            const cats = client.cats.useList();
            yield cats.queryFn();
            (0, vitest_1.expect)(mockFetch).toBeCalledWith("/api/cats", { method: "GET" });
        }));
        (0, vitest_1.it)("Should allow for query params", () => __awaiter(void 0, void 0, void 0, function* () {
            client.cats.list.useQuery({ query: { color: "black" } });
            (0, vitest_1.expect)(mockUseQuery).toBeCalledWith({
                queryFn: vitest_1.expect.any(Function),
                queryKey: ["/api/cats"],
            });
        }));
    });
});
//# sourceMappingURL=extensions.test.js.map