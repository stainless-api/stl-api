"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiRouteMap = void 0;
const lodash_1 = __importDefault(require("lodash"));
const { isEmpty } = lodash_1.default;
const client_js_1 = require("../client.js");
function getApiRouteMap({ basePath, topLevel, resources, }) {
    /**
     * Returns true iff the client would guess the correct method and path
     * for the given resource path and action
     */
    function isRegular(resourcePath, action, endpoint) {
        const guessed = (0, client_js_1.guessRequestEndpoint)(basePath, resourcePath, action);
        return (
        // is guessed exactly
        endpoint.endpoint === guessed ||
            // is guessed + one path param
            (endpoint.endpoint.startsWith(guessed + "/") &&
                /\{[^}/]+\}/.test(endpoint.endpoint.substring(guessed.length + 1))));
    }
    function getResourceMetadata({ actions, namespacedResources }, path = []) {
        const result = {};
        if (actions) {
            for (const action of Object.keys(actions)) {
                const endpoint = actions[action];
                if (isRegular(path, action, endpoint))
                    continue;
                const resultActions = result.actions || (result.actions = {});
                resultActions[action] = getActionMetadata(endpoint);
            }
        }
        if (namespacedResources) {
            for (const name of Object.keys(namespacedResources)) {
                const resource = namespacedResources[name];
                const metadata = getResourceMetadata(resource, [...path, name]);
                if (isEmpty(metadata))
                    continue;
                const resultResources = result.namespacedResources || (result.namespacedResources = {});
                resultResources[name] = metadata;
            }
        }
        return result;
    }
    function getActionMetadata({ endpoint }) {
        return { endpoint };
    }
    return getResourceMetadata({
        actions: topLevel.actions,
        namespacedResources: resources,
    });
}
exports.getApiRouteMap = getApiRouteMap;
//# sourceMappingURL=getApiRouteMap.js.map