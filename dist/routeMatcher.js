"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidRouteMatch = exports.makeRouteMatcher = void 0;
const trie_router_1 = require("hono/router/trie-router");
const stainless_1 = require("stainless");
/**
 * Converts an endpoint from a format like 'GET /users/{id}'
 * to ['GET', '/users/:id']
 */
function endpointToHono(endpoint) {
    const [method, path] = (0, stainless_1.parseEndpoint)(endpoint);
    const pathParts = path
        .split("/")
        .map((el) => el.replace(/^\{([^}]+)\}$/, ":$1"));
    const unsupportedEl = pathParts.find((el) => el.includes("{"));
    if (unsupportedEl) {
        // TODO: hono routers don't support variables in the middle of a
        // path element, but they do support regexes, so we'd need to convert
        // this
        throw new Error(`path element isn't currently supported: ${unsupportedEl}`);
    }
    return [method, pathParts.join("/")];
}
function makeRouteMatcher(endpoints) {
    const routeMatcher = new trie_router_1.TrieRouter();
    for (const endpoint of endpoints) {
        const [method, path] = endpointToHono(endpoint.endpoint);
        routeMatcher.add(method, path, endpoint);
    }
    return routeMatcher;
}
exports.makeRouteMatcher = makeRouteMatcher;
function isValidRouteMatch(m) {
    if (!m)
        return false;
    if (m[0].length === 0)
        return false;
    return true;
}
exports.isValidRouteMatch = isValidRouteMatch;
//# sourceMappingURL=routeMatcher.js.map