"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const api_client_1 = require("./api-client");
(0, vitest_1.describe)("Inferring HTTP method from verb", () => {
    (0, vitest_1.it)("defaults to GET", () => {
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("foobarbaz")).toEqual("GET");
    });
    (0, vitest_1.it)("defaults to GET if there is no body", () => {
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("foobarbaz", undefined)).toEqual("GET");
    });
    (0, vitest_1.it)("defaults to POST if there is a body", () => {
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("foobarbaz", {})).toEqual("POST");
    });
    (0, vitest_1.it)("can infer GET", () => {
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("get")).toEqual("GET");
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("list")).toEqual("GET");
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("retrieve")).toEqual("GET");
    });
    (0, vitest_1.it)("can infer POST", () => {
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("post")).toEqual("POST");
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("create")).toEqual("POST");
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("make")).toEqual("POST");
    });
    (0, vitest_1.it)("can infer PUT", () => {
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("put")).toEqual("PUT");
    });
    (0, vitest_1.it)("can infer PATCH", () => {
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("patch")).toEqual("PATCH");
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("update")).toEqual("PATCH");
    });
    (0, vitest_1.it)("can infer DELETE", () => {
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("delete")).toEqual("DELETE");
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("destroy")).toEqual("DELETE");
    });
    (0, vitest_1.it)("can infer from prefixed key word", () => {
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("useUpdate")).toEqual("PATCH");
    });
    (0, vitest_1.it)("can infer from suffixed key word", () => {
        (0, vitest_1.expect)((0, api_client_1.inferHTTPMethod)("updateAllCats")).toEqual("PATCH");
    });
});
//# sourceMappingURL=http-method-inference.test.js.map