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
exports.makeClientWithExplicitTypes = exports.makeClientWithInferredTypes = exports.inferHTTPMethod = void 0;
const strings_1 = require("../util/strings");
const extensions_1 = require("../extensions");
const methodSynonyms = {
    GET: ["get", "list", "retrieve"],
    POST: ["post", "create", "make"],
    PUT: ["put"],
    PATCH: ["patch", "update"],
    DELETE: ["delete", "destroy", "remove"],
    OPTIONS: ["options"],
    HEAD: ["head"],
};
/**
 * Since the client needs to operate only on types,
 * we have to guess the correct HTTP verb from the method at the end of the client API call chain
 * @param action Client API method name, e.g. list, useRetrieve
 * @param body Request body
 * @returns HttpMethod
 */
function inferHTTPMethod(action, body) {
    for (const [method, words] of Object.entries(methodSynonyms)) {
        if (words.some((word) => action.toLowerCase().includes(word))) {
            return method; // Object.entries is poorly typed
        }
    }
    return body ? "POST" : "GET";
}
exports.inferHTTPMethod = inferHTTPMethod;
function isAwaitingPromise(callSite) {
    return callSite === "then";
}
function isCallingHook(callSite) {
    const hookRegex = /use[A-Z]\w+/;
    const isHook = callSite.match(hookRegex);
    return isHook;
}
function isValidPathParam(arg) {
    return typeof arg === "string" || typeof arg === "number";
}
function isQueryOrBody(arg) {
    return typeof arg === "object";
}
function makeUrl([basePath, ...callPath], { outputCase, method, body, query, }) {
    let url = outputCase === "kebab" || outputCase === undefined
        ? callPath
            .map((str) => str.startsWith(":") ? str.replace(":", "") : (0, strings_1.kebabCase)(str))
            .join("/")
        : callPath.map((str) => str.replace(":", "")).join("/");
    if (query) {
        url = `${url}?${new URLSearchParams(Object.entries(query))}`;
    }
    else if (method === "GET" && body !== undefined && body !== null) {
        url = `${url}?${new URLSearchParams(Object.entries(body))}`;
    }
    return `${basePath}/${url}`;
}
/**
 * Our wrapper around fetch. For now we presume the response is JSON and handle it as such for the caller.
 * @param config
 * @param action Client API method name, e.g. list, useRetrieve
 * @param callPath Each part of the URL we will hit based on the client API call chain
 * @param body Request body
 * @returns
 */
function makeRequest(config, action, callPath, body, query) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const method = inferHTTPMethod(action, body);
        const url = makeUrl(callPath, {
            outputCase: config.urlCase,
            method,
            body,
            query,
        });
        const fetchFn = (_a = config.fetch) !== null && _a !== void 0 ? _a : fetch;
        const options = method !== "GET" && body !== undefined
            ? {
                body: JSON.stringify(body),
                method,
                headers: {
                    "Content-Type": "application/json",
                },
            }
            : { method };
        const response = yield fetchFn(url, options);
        if (!response.ok) {
            throw response;
        }
        try {
            return yield response.json();
        }
        catch (e) {
            return response;
        }
    });
}
function createClientProxy(config, callPath, pendingArgs = []) {
    const proxyClient = function () { };
    return new Proxy(proxyClient, {
        get(_target, key) {
            if (typeof key === "symbol" || key === "prototype") {
                return;
            }
            if (isAwaitingPromise(key)) {
                // Allow the subsequent "apply" hook to handle resolving the API request
                // Ensure the pendingArgs are passed through in case they contain a body param
                return createClientProxy(config, [...callPath, key], pendingArgs);
            }
            if (isValidPathParam(pendingArgs[0])) {
                callPath.push(":" + pendingArgs[0].toString());
            }
            return createClientProxy(config, [...callPath, key], isQueryOrBody(pendingArgs[0]) ? pendingArgs : undefined);
        },
        apply(_target, _thisArg, argumentsList) {
            const lastCall = callPath[callPath.length - 1];
            if (isAwaitingPromise(lastCall)) {
                const [resolve, reject] = argumentsList;
                // Remove "then" from callPath and use previous args
                callPath.pop();
                const action = callPath.slice(-1)[0];
                const path = callPath.slice(0, -1);
                const body = pendingArgs[0];
                const request = makeRequest(config, action, path, body);
                return request.then(resolve).catch(reject);
            }
            if (config.extensions) {
                const [action, extensionMethod] = callPath.slice(-2);
                const path = callPath.slice(0, -2);
                const bodyOrQuery = isQueryOrBody(pendingArgs[0])
                    ? pendingArgs[0]
                    : undefined;
                const queryFn = (callTimeBody) => {
                    const method = inferHTTPMethod(action);
                    const body = method === "GET" ? undefined : callTimeBody;
                    const query = method === "GET" ? bodyOrQuery : undefined;
                    return makeRequest(config, action, path, body, query);
                };
                const queryKey = [
                    makeUrl(path, { outputCase: config.urlCase, method: "GET" }),
                ];
                const handler = (0, extensions_1.getExtensionHandler)(config.extensions, extensionMethod, queryFn, queryKey);
                if (handler) {
                    return handler(...argumentsList);
                }
            }
            if (isCallingHook(lastCall)) {
                const action = callPath.slice(-1)[0];
                const path = callPath.slice(0, -1);
                const body = argumentsList[0];
                return {
                    queryFn: () => makeRequest(config, action, path, body),
                    queryKey: [
                        makeUrl(path, { outputCase: config.urlCase, method: "GET" }),
                    ],
                };
            }
            return createClientProxy(config, callPath, argumentsList);
        },
    });
}
/**
 * Main entry for the client library
 * Provides an interface to construct API calls to a server with a matching API configuration
 * @param config
 * @returns Client API
 */
function makeClientWithInferredTypes(config) {
    return createClientProxy(config, [config.basePath]);
}
exports.makeClientWithInferredTypes = makeClientWithInferredTypes;
/**
 * Main entry for the client library
 * Provides an interface to construct API calls to a server with a matching API configuration
 * @param config
 * @returns Client API
 */
function makeClientWithExplicitTypes(config) {
    return createClientProxy(config, [config.basePath]);
}
exports.makeClientWithExplicitTypes = makeClientWithExplicitTypes;
//# sourceMappingURL=api-client.js.map