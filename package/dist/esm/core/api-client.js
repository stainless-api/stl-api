var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { kebabCase } from "../util/strings";
import { getExtensionHandler } from "../extensions";
const methodSynonyms = {
    GET: ["get", "list", "retrieve"],
    POST: ["post", "create", "make"],
    PUT: ["put"],
    PATCH: ["patch", "update"],
    DELETE: ["delete", "destroy"],
    OPTIONS: [],
    HEAD: [],
};
/**
 * Since the client needs to operate only on types,
 * we have to guess the correct HTTP verb from the method at the end of the client API call chain
 * @param action Client API method name, e.g. list, useRetrieve
 * @param body Request body
 * @returns HttpMethod
 */
export function inferHTTPMethod(action, body) {
    for (const [method, words] of Object.entries(methodSynonyms)) {
        if (words.some((word) => action.toLowerCase().includes(word))) {
            return method; // Object.entries is poorly typed
        }
    }
    return body ? "POST" : "GET";
}
function isAwaitingPromise(callSite) {
    return callSite === "then";
}
function isCallingHook(callSite) {
    const isHook = callSite.startsWith("use");
    return isHook;
}
function isValidPathParam(arg) {
    return typeof arg === "string" || typeof arg === "number";
}
function makeUrl(callPath, outputCase = "kebab") {
    return outputCase === "kebab"
        ? callPath.map(kebabCase).join("/")
        : callPath.join("/");
}
/**
 * Our wrapper around fetch. For now we presume the response is JSON and handle it as such for the caller.
 * @param config
 * @param action Client API method name, e.g. list, useRetrieve
 * @param callPath Each part of the URL we will hit based on the client API call chain
 * @param body Request body
 * @returns
 */
function makeRequest(config, action, callPath, body) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const method = inferHTTPMethod(action, body);
        const url = makeUrl(callPath, config.urlCase);
        const fetchFn = (_a = config.fetch) !== null && _a !== void 0 ? _a : fetch;
        const options = body
            ? {
                body: JSON.stringify(body),
                method,
            }
            : { method };
        console.log("Making request", { url, method, options });
        console.log({ fetchFn });
        const response = yield fetchFn(url, options);
        console.log({ response });
        return yield response.json();
    });
}
function createClientProxy(config, callPath, pendingArgs = []) {
    const proxyClient = function () { };
    return new Proxy(proxyClient, {
        get(_target, key) {
            console.log("proxy get", key, { callPath, pendingArgs });
            if (typeof key === "symbol") {
                return;
            }
            if (isAwaitingPromise(key)) {
                console.log("if (isAwaitingPromise(key))");
                // Allow the subsequent "apply" hook to handle resolving the API request
                // Ensure the pendingArgs are passed through in case they contain a body param
                return createClientProxy(config, [...callPath, key], pendingArgs);
            }
            if (isValidPathParam(pendingArgs[0])) {
                callPath.push(pendingArgs[0].toString());
            }
            return createClientProxy(config, [...callPath, key], undefined);
        },
        apply(_target, _thisArg, argumentsList) {
            console.log("proxy apply", { callPath, pendingArgs, argumentsList });
            const lastCall = callPath[callPath.length - 1];
            if (isAwaitingPromise(lastCall)) {
                console.log("if (isAwaitingPromise(lastCall))");
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
                console.log("if (config.extensions)");
                const [action, extensionMethod] = callPath.slice(-2);
                const path = callPath.slice(0, -2);
                const body = argumentsList[0];
                console.log({ action, extensionMethod, path });
                const queryFn = () => makeRequest(config, action, path, body);
                const queryKey = [makeUrl(path, config.urlCase)];
                const handler = getExtensionHandler(config.extensions, extensionMethod, queryFn, queryKey);
                if (handler) {
                    console.log("using extension handler");
                    return handler(...argumentsList);
                }
                console.log("no extension handler found");
            }
            if (isCallingHook(lastCall)) {
                console.log("if (isCallingHook(lastCall))");
                const action = callPath.slice(-1)[0];
                const path = callPath.slice(0, -1);
                const body = argumentsList[0];
                return {
                    queryFn: () => makeRequest(config, action, path, body),
                    queryKey: [makeUrl(path, config.urlCase)],
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
export function makeClient(config) {
    console.log("Making client");
    return createClientProxy(config, [config.basePath]);
}
//# sourceMappingURL=api-client.js.map