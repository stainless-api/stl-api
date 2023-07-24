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
exports.stlExpressAPI = exports.stlExpressAPIRouter = exports.addStlAPIToExpress = exports.stlExpressResourceRouter = exports.addStlResourceToExpress = exports.addStlEndpointToExpress = exports.stlExpressErrorHandler = exports.methodNotAllowedHandler = exports.stlExpressRouteHandler = exports.stlExecuteExpressRequest = void 0;
const express_1 = __importStar(require("express"));
const stainless_1 = require("stainless");
const stainless_2 = require("stainless");
/**
 * Executes the given Express request on the given Stainless API Endpoint, returning
 * the result from the endpoint handler without sending it in a response.
 *
 * @param endpoint the endpoint to execute the request on
 * @param req the Express request
 * @param res the Express response
 * @returns a Promise that resolves to the return value of the endpoint handler,
 * or rejects if it throws an error
 */
function stlExecuteExpressRequest(endpoint, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { params: path, headers, body, query } = req;
        const { stl } = endpoint;
        const server = {
            type: "express",
            args: [req, res],
        };
        const context = stl.initContext({
            endpoint,
            headers,
            server,
        });
        const params = stl.initParams({
            path,
            query,
            body,
            headers,
        });
        return yield stl.execute(params, context);
    });
}
exports.stlExecuteExpressRequest = stlExecuteExpressRequest;
/**
 * Creates an express route handler function for the given stainless endpoint.
 */
function stlExpressRouteHandler(endpoint, options) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield stlExecuteExpressRequest(endpoint, req, res);
            res.status(200).json(result);
            return;
        }
        catch (error) {
            if ((options === null || options === void 0 ? void 0 : options.handleErrors) === false) {
                next(error);
                return;
            }
            (0, exports.stlExpressErrorHandler)(error, req, res, next);
            return;
        }
    });
}
exports.stlExpressRouteHandler = stlExpressRouteHandler;
const methodNotAllowedHandler = (req, res) => {
    res.status(405).send();
};
exports.methodNotAllowedHandler = methodNotAllowedHandler;
/**
 * The default Express error handler middleware for errors thrown from
 * Stainless endpoints
 */
const stlExpressErrorHandler = (error, req, res) => {
    if (error instanceof stainless_1.StlError) {
        res.status(error.statusCode).json(error.response);
        return;
    }
    console.error(`ERROR in ${req.method} ${req.url}:`, error instanceof Error ? error.stack : error);
    res.status(500).json({ error, details: "Failed to handle the request." });
};
exports.stlExpressErrorHandler = stlExpressErrorHandler;
function applyBasePathMap(path, basePathMap) {
    if (basePathMap) {
        for (const k in basePathMap) {
            if (path.startsWith(k)) {
                return path.replace(k, basePathMap[k]);
            }
        }
    }
    return path;
}
function convertExpressPath(path, basePathMap) {
    return applyBasePathMap(path, basePathMap)
        .split("/")
        .map((el) => el.replace(/^\{(.+)\}$/, ":$1"))
        .join("/");
}
/**
 * Registers a Stainless endpoint with the given Express Application or Router.
 */
function addStlEndpointToExpress(router, endpoint, options) {
    const [method, path] = (0, stainless_2.parseEndpoint)(endpoint.endpoint);
    const expressPath = convertExpressPath(path, options === null || options === void 0 ? void 0 : options.basePathMap);
    router[method](expressPath, 
    // @ts-expect-error this is valid
    stlExpressRouteHandler(endpoint, options));
}
exports.addStlEndpointToExpress = addStlEndpointToExpress;
function addMethodNotAllowedHandlers(router, resource, options, visited = new Set()) {
    const { actions, namespacedResources } = resource;
    if (actions) {
        for (const action of Object.keys(actions)) {
            const endpoint = actions[action];
            if (!endpoint)
                continue;
            const [, path] = (0, stainless_2.parseEndpoint)(endpoint.endpoint);
            if (visited.has(path))
                continue;
            visited.add(path);
            router.all(convertExpressPath(path, options === null || options === void 0 ? void 0 : options.basePathMap), 
            // @ts-expect-error
            exports.methodNotAllowedHandler);
        }
    }
    if (namespacedResources) {
        for (const name of Object.keys(namespacedResources)) {
            addMethodNotAllowedHandlers(router, namespacedResources[name], options, visited);
        }
    }
}
/**
 * Registers all endpoints in a Stainless resource with the given Express Application or Router.
 */
function addStlResourceToExpress(router, resource, options) {
    const { actions, namespacedResources } = resource;
    if (actions) {
        for (const action of Object.keys(actions)) {
            const endpoint = actions[action];
            if (!endpoint)
                continue;
            addStlEndpointToExpress(router, endpoint, options);
        }
    }
    if ((options === null || options === void 0 ? void 0 : options.addMethodNotAllowedHandlers) !== false) {
        if (namespacedResources) {
            for (const name of Object.keys(namespacedResources)) {
                addStlResourceToExpress(router, namespacedResources[name], options);
            }
        }
        addMethodNotAllowedHandlers(router, resource, options);
    }
}
exports.addStlResourceToExpress = addStlResourceToExpress;
/**
 * Creates an Express Router for the given Stainless resource
 */
function stlExpressResourceRouter(resource, options) {
    const router = (0, express_1.Router)(options);
    router.use(express_1.default.json());
    router.use(express_1.default.text());
    router.use(express_1.default.raw());
    addStlResourceToExpress(router, resource, options);
    return router;
}
exports.stlExpressResourceRouter = stlExpressResourceRouter;
/**
 * Registers all endpoints in a Stainless API with the given Express Application or Router.
 */
function addStlAPIToExpress(router, api, options) {
    const { topLevel, resources } = api;
    addStlResourceToExpress(router, {
        actions: topLevel.actions,
        namespacedResources: resources,
    }, options);
}
exports.addStlAPIToExpress = addStlAPIToExpress;
/**
 * Creates an Express Router for the given Stainless API
 */
function stlExpressAPIRouter(api, options) {
    const router = (0, express_1.Router)();
    router.use(express_1.default.json());
    router.use(express_1.default.text());
    router.use(express_1.default.raw());
    addStlAPIToExpress(router, api, options);
    return router;
}
exports.stlExpressAPIRouter = stlExpressAPIRouter;
function stlExpressAPI(api, options) {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use(express_1.default.text());
    app.use(express_1.default.raw());
    addStlAPIToExpress(app, api, options);
    return app;
}
exports.stlExpressAPI = stlExpressAPI;
//# sourceMappingURL=index.js.map