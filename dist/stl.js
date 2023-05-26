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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeStl = exports.OpenAPIResponse = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.StlError = exports.allEndpoints = exports.parseEndpoint = exports.createClient = exports.z = exports.parseSelect = void 0;
const z = __importStar(require("./z"));
exports.z = z;
const openapiSpec_1 = require("./openapiSpec");
var parseSelect_1 = require("./parseSelect");
Object.defineProperty(exports, "parseSelect", { enumerable: true, get: function () { return parseSelect_1.parseSelect; } });
var client_1 = require("./client");
Object.defineProperty(exports, "createClient", { enumerable: true, get: function () { return client_1.createClient; } });
function parseEndpoint(endpoint) {
    const [method, path] = endpoint.split(/\s+/, 2);
    switch (method) {
        case "get":
        case "post":
        case "put":
        case "patch":
        case "delete":
            break;
        default:
            throw new Error(`invalid or unsupported http method: ${method}`);
    }
    if (!path.startsWith("/")) {
        throw new Error(`Invalid path must start with a slash (/); got: "${endpoint}"`);
    }
    return [method, path];
}
exports.parseEndpoint = parseEndpoint;
function allEndpoints(resource) {
    return [
        ...Object.keys(resource.actions || {})
            .map((k) => resource.actions[k])
            .filter(Boolean),
        ...Object.keys(resource.namespacedResources || {}).flatMap((k) => allEndpoints(resource.namespacedResources[k])),
    ];
}
exports.allEndpoints = allEndpoints;
class StlError extends Error {
    constructor(statusCode, response) {
        super(JSON.stringify(response));
        this.statusCode = statusCode;
        this.response = response;
    }
}
exports.StlError = StlError;
class BadRequestError extends StlError {
    constructor(response) {
        super(400, Object.assign({ error: "bad request" }, response));
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends StlError {
    constructor(response) {
        super(401, Object.assign({ error: "unauthorized" }, response));
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends StlError {
    constructor(response) {
        super(403, Object.assign({ error: "forbidden" }, response));
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends StlError {
    constructor(response) {
        super(404, Object.assign({ error: "not found" }, response));
    }
}
exports.NotFoundError = NotFoundError;
exports.OpenAPIResponse = z.object({}).passthrough();
const prependZodPath = (path) => (error) => {
    if (error instanceof z.ZodError) {
        for (const issue of error.issues) {
            issue.path.unshift(path);
        }
    }
    throw error;
};
function makeStl(opts) {
    const plugins = {};
    const stl = {
        initContext(c) {
            return c;
        },
        initParams(p) {
            return p;
        },
        // this gets filled in later, we just declare the type here.
        plugins: {},
        execute: function execute(endpoint, params, context) {
            var _a, _b, _c;
            return __awaiter(this, void 0, void 0, function* () {
                for (const plugin of Object.values(plugins)) {
                    const middleware = plugin.middleware;
                    if (middleware)
                        yield middleware(endpoint, params, context);
                }
                const parseParams = {
                    stlContext: context,
                };
                context.parsedParams = {
                    path: undefined,
                    query: undefined,
                    body: undefined,
                };
                try {
                    context.parsedParams.query = yield ((_a = endpoint.query) === null || _a === void 0 ? void 0 : _a.parseAsync(params.query, parseParams).catch(prependZodPath("<stainless request query>")));
                    context.parsedParams.path = yield ((_b = endpoint.path) === null || _b === void 0 ? void 0 : _b.parseAsync(params.path, parseParams).catch(prependZodPath("<stainless request path>")));
                    context.parsedParams.body = yield ((_c = endpoint.body) === null || _c === void 0 ? void 0 : _c.parseAsync(params.body, parseParams).catch(prependZodPath("<stainless request body>")));
                }
                catch (error) {
                    if (error instanceof z.ZodError) {
                        throw new BadRequestError({ issues: error.issues });
                    }
                    throw error;
                }
                const { query, path, body } = context.parsedParams;
                const responseInput = yield endpoint.handler(Object.assign(Object.assign(Object.assign({}, body), path), query), context);
                const response = endpoint.response
                    ? yield endpoint.response.parseAsync(responseInput, parseParams)
                    : undefined;
                return response;
            });
        },
        StlError,
        BadRequestError,
        UnauthorizedError,
        ForbiddenError,
        NotFoundError,
        openapiSpec: openapiSpec_1.openapiSpec,
        endpoint: (_a) => {
            var { config, response, path, query, body } = _a, rest = __rest(_a, ["config", "response", "path", "query", "body"]);
            return Object.assign({ config: config, response: (response || z.void()), path: path, query: query, body: body }, rest);
        },
        resource: (_a) => {
            var { actions, namespacedResources, models } = _a, config = __rest(_a, ["actions", "namespacedResources", "models"]);
            return Object.assign(Object.assign({}, config), { actions: actions || {}, namespacedResources: namespacedResources || {}, models: models || {} });
        },
        api: ({ openapi, topLevel, resources, }) => {
            var _a;
            const openapiEndpoint = (_a = openapi === null || openapi === void 0 ? void 0 : openapi.endpoint) !== null && _a !== void 0 ? _a : "get /api/openapi";
            const topLevelActions = (topLevel === null || topLevel === void 0 ? void 0 : topLevel.actions) || {};
            const apiDescription = {
                openapi: {
                    endpoint: openapiEndpoint,
                    get spec() {
                        // TODO memoize
                        return stl.openapiSpec(apiDescription);
                    },
                },
                topLevel: Object.assign(Object.assign({}, topLevel), { actions: topLevelActions }),
                resources: resources || {},
            };
            if (openapiEndpoint !== false) {
                topLevelActions.getOpenapi = stl.endpoint({
                    endpoint: openapiEndpoint,
                    response: exports.OpenAPIResponse,
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () {
                            return stl.openapiSpec(apiDescription);
                        });
                    },
                });
            }
            return apiDescription;
        },
    };
    for (const key in opts.plugins) {
        const makePlugin = opts.plugins[key];
        const plugin = (plugins[key] = makePlugin(stl));
        if (plugin.statics) {
            stl.plugins[key] = plugin.statics;
        }
    }
    return stl;
}
exports.makeStl = makeStl;
//# sourceMappingURL=stl.js.map