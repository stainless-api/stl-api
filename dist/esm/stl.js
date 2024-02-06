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
import * as z from "./z";
import { openapiSpec } from "./openapiSpec";
import coerceParams from "./coerceParams";
export { parseSelect } from "./parseSelect";
export { z };
export { createClient } from "./client";
export { createRecursiveProxy } from "./createRecursiveProxy";
export { ClientPromise, PaginatorPromise, } from "./client";
export { getApiRouteMap } from "./gen/getApiRouteMap";
export function parseEndpoint(endpoint) {
    const [method, path] = endpoint.split(/\s+/, 2);
    switch (method) {
        case "GET":
        case "POST":
        case "PUT":
        case "PATCH":
        case "DELETE":
        case "OPTIONS":
        case "HEAD":
            break;
        default:
            throw new Error(`invalid or unsupported http method: ${method}`);
    }
    if (!path.startsWith("/")) {
        throw new Error(`Invalid path must start with a slash (/); got: "${endpoint}"`);
    }
    return [method, path];
}
const coercedPath = Symbol("coercedPath");
const coercedQuery = Symbol("coercedQuery");
/**
 * Gets all endpoints associated with a given resource
 */
export function allEndpoints(resource) {
    return [
        ...Object.keys(resource.actions || {})
            .map((k) => resource.actions[k])
            .filter(Boolean),
        ...Object.keys(resource.namespacedResources || {}).flatMap((k) => allEndpoints(resource.namespacedResources[k])),
    ];
}
export const apiSymbol = Symbol("api");
export function isAPIDescription(value) {
    return (value === null || value === void 0 ? void 0 : value[apiSymbol]) === true;
}
export const isStlError = (value) => {
    return value instanceof StlError || (value === null || value === void 0 ? void 0 : value._isStlError) === true;
};
/**
 * Throw `StlError` and its subclasses within endpoint `handler` methods
 * to return 4xx or 5xx HTTP error responses to the user, with well-formatted
 * bodies.
 *
 * `StlError` is best used to create custom subclasses if you need HTTP status
 * codes we don't yet provide out of the box.
 */
export class StlError extends Error {
    /**
     * @param statusCode
     * @param response optional data included in the body of the response JSON.
     */
    constructor(statusCode, response) {
        super(JSON.stringify(response));
        this.statusCode = statusCode;
        this.response = response;
        this._isStlError = true;
    }
}
/** When thrown in an endpoint handler, responds with HTTP status code 400. */
export class BadRequestError extends StlError {
    /**
     * @param response  optional data included in the body of the response JSON.
     */
    constructor(response) {
        super(400, Object.assign({ error: "bad request" }, response));
        Object.setPrototypeOf(this, StlError.prototype);
    }
}
/** When thrown in an endpoint handler, responds with HTTP status code 401. */
export class UnauthorizedError extends StlError {
    /**
     * @param response  optional data included in the body of the response JSON.
     */
    constructor(response) {
        super(401, Object.assign({ error: "unauthorized" }, response));
        Object.setPrototypeOf(this, StlError.prototype);
    }
}
/** When thrown in an endpoint handler, responds with HTTP status code 403. */
export class ForbiddenError extends StlError {
    /**
     * @param response  optional data included in the body of the response JSON.
     */
    constructor(response) {
        super(403, Object.assign({ error: "forbidden" }, response));
        Object.setPrototypeOf(this, StlError.prototype);
    }
}
/** When thrown in an endpoint handler, responds with HTTP status code 404. */
export class NotFoundError extends StlError {
    /**
     * @param response  optional data included in the body of the response JSON.
     */
    constructor(response) {
        super(404, Object.assign({ error: "not found" }, response));
        Object.setPrototypeOf(this, StlError.prototype);
    }
}
export const OpenAPIResponse = z.object({}).passthrough();
const prependZodPath = (path) => (error) => {
    if (error instanceof z.ZodError) {
        for (const issue of error.issues) {
            issue.path.unshift(path);
        }
    }
    throw error;
};
/**
 * The entry-point into using Stainless. Used to create the core
 * structures of the framework: endpoints, resources, and APIs.
 *
 * ## Usage
 * Creating an instance is easy:
 * ```ts
 * export const stl = new Stl({})
 * ```
 *
 * For a higher-level overview of how to use `Stl` to build APIs,
 * see [the docs](https://stainlessapi.com/stl/getting-started).
 */
export class Stl {
    /**
     *
     * @param opts {CreateStlOptions<Plugins>} customize the created instance with plugins
     */
    constructor(opts) {
        // this gets filled in later, we just declare the type here.
        this.plugins = {};
        this.stainlessPlugins = {};
        for (const key in opts.plugins) {
            const makePlugin = opts.plugins[key];
            const plugin = (this.stainlessPlugins[key] = makePlugin(this));
            if (plugin.statics) {
                // PluginStatics only allows keys with non-nullable values
                // We ensure this is the case by checking that plugin.statics is
                // not falsy
                // @ts-expect-error
                this.plugins[key] = plugin.statics;
            }
        }
        this.typeSchemas = opts.typeSchemas;
    }
    /**
     * Initializes a {@link StlContext} for a request. This should only
     * be used for advanced use-cases like implementing a plugin for
     * integrating with an underlying server implementation.
     * For a usage example, see `../../next/src/nextPlugin.rs`.
     * @param c the context to initialize
     * @returns initialized context
     */
    initContext(c) {
        return c;
    }
    /**
     * Initializes parameters for handling requests. This should only
     * be used for advanced use-cases like implementing a plugin for
     * integrating with an underluing server implementation.
     * For a usage example, see `../../next/src/nextPlugin.rs`.
     * @param p the parameters to initialize
     * @returns initialized parameters
     */
    initParams(p) {
        return p;
    }
    loadEndpointTypeSchemas(endpoint) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!endpoint.query &&
                !endpoint.path &&
                !endpoint.body &&
                !endpoint.response) {
                if (!this.typeSchemas) {
                    throw new Error("Failed to provide `typeSchemas` to stl instance while using codegen schemas");
                }
                try {
                    const schemas = yield ((_b = (_a = this.typeSchemas)[endpoint.endpoint]) === null || _b === void 0 ? void 0 : _b.call(_a));
                    if (schemas) {
                        endpoint.path = schemas.path;
                        endpoint.query = schemas.query;
                        endpoint.body = schemas.body;
                        endpoint.response = schemas.response;
                    }
                    else {
                        throw new Error("error encountered while handling endpoint " +
                            endpoint.endpoint +
                            ": no schema found. run the `stl` cli on the project to generate the schema for the endpoint.");
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
        });
    }
    /**
     * Runs middleware and gets the parsed params to pass to an endpoint handler.
     * This should not be called in typical use.
     * It is primarily useful for implementing a plugin for
     * integrating with an underluing server implementation.
     * For a usage example, see `../../express/src/index.ts`.
     * @param params request params
     * @param context context with `stl` and request-specific data
     * @returns a Promise that resolves to [request, context]
     */
    parseParams(params, context) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.parseParamsWithContext(params, context))[0];
        });
    }
    /**
     * Runs middleware and gets the parsed params and context arguments to
     * pass to an endpoint handler.
     * This should not be called in typical use.
     * It is primarily useful for implementing a plugin for
     * integrating with an underluing server implementation.
     * For a usage example, see `../../express/src/index.ts`.
     * @param params request params
     * @param context context with `stl` and request-specific data
     * @returns a Promise that resolves to [request, context]
     */
    parseParamsWithContext(params, context) {
        var _a, _b, _c;
        var _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadEndpointTypeSchemas(context.endpoint);
            for (const plugin of Object.values(this.stainlessPlugins)) {
                const middleware = plugin.middleware;
                if (middleware)
                    yield middleware(params, context);
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
                if (context.endpoint.query) {
                    (_a = (_d = context.endpoint)[coercedQuery]) !== null && _a !== void 0 ? _a : (_d[coercedQuery] = coerceParams(context.endpoint.query));
                    context.parsedParams.query = yield context.endpoint[coercedQuery]
                        .parseAsync(params.query, parseParams)
                        .catch(prependZodPath("<stainless request query>"));
                }
                if (context.endpoint.path) {
                    (_b = (_e = context.endpoint)[coercedPath]) !== null && _b !== void 0 ? _b : (_e[coercedPath] = coerceParams(context.endpoint.path));
                    context.parsedParams.path = yield context.endpoint[coercedPath]
                        .parseAsync(params.path, parseParams)
                        .catch(prependZodPath("<stainless request path>"));
                }
                context.parsedParams.body = yield ((_c = context.endpoint.body) === null || _c === void 0 ? void 0 : _c.parseAsync(params.body, parseParams).catch(prependZodPath("<stainless request body>")));
            }
            catch (error) {
                if (error instanceof z.ZodError) {
                    throw new BadRequestError({ issues: error.issues });
                }
                throw error;
            }
            const { query, path, body } = context.parsedParams;
            return [Object.assign(Object.assign(Object.assign({}, path), query), body), context];
        });
    }
    /**
     * Handles an incoming request by invoking the endpoint for it.
     * This should not be called in typical use.
     * It is primarily useful for implementing a plugin for
     * integrating with an underluing server implementation.
     * For a usage example, see `../../next/src/nextPlugin.ts`.
     * @param endpoint endpoint to handle incoming request
     * @param params request params
     * @param context context with `stl` and request-specific data
     * @returns request response
     */
    execute(params, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { endpoint } = context;
            if (!endpoint.handler) {
                throw new Error(`no endpoint handler defined`);
            }
            const [request, ctx] = yield this.parseParamsWithContext(params, context);
            const responseInput = yield endpoint.handler(request, ctx);
            const parseParams = {
                stlContext: ctx,
            };
            const response = endpoint.response
                ? yield endpoint.response.parseAsync(responseInput, parseParams)
                : undefined;
            return response;
        });
    }
    /**
     * Creates an endpoint.
     *
     * @param endpoint A string declaring the HTTP method and URL for this endpoint
     * @param config optional configuration for the endpoint
     * @param response optional schema of response, defaults to `z.void()`
     * @param path optional schema of path params
     * @param query optional schema of query params
     * @param body optional schema of body params
     * @param handler the function that handles requests to this endpoint
     * @returns endpoint instance
     *
     * ## Example
     * ```ts
     * // ~/api/users/retrieve.ts
     *
     * export const retrieve = stl.endpoint({
     *   endpoint: "GET /api/users/{userId}",
     *   response: User,
     *   path: z.object({
     *     userId: z.string(),
     *   }),
     *   async handler({ userId }, ctx) {
     *     const user = await prisma.user.findUnique({
     *       where: {
     *         id: userId,
     *       },
     *     });
     *     if (!user) throw new NotFoundError();
     *     return user;
     *   },
     * });
     * ```
     */
    endpoint(params) {
        const { config, response, path, query, body } = params, rest = __rest(params, ["config", "response", "path", "query", "body"]);
        return Object.assign({ stl: this, config: config, response: (response || z.void()), path: path, query: query, body: body }, rest);
    }
    /**
     * Creates a resource.
     *
     * @param models
     * @param actions
     * @param namespacedResources
     * @param internal
     * @param summary
     * @returns resource instance
     *
     * ## Example
     * ```ts
     * // ~/api/posts/index.ts
     *
     * export const posts = stl.resource({
     *   summary: "Posts; the tweets of this twitter clone",
     *   internal: false,
     *   models: {
     *     Post,
     *     PostPage,
     *     PostSelection,
     *   },
     *   actions: {
     *     create,
     *     list,
     *     retrieve,
     *   },
     * });
     * ```
     */
    resource(_a) {
        var { actions, namespacedResources, models } = _a, config = __rest(_a, ["actions", "namespacedResources", "models"]);
        return Object.assign(Object.assign({}, config), { actions: actions || {}, namespacedResources: namespacedResources || {}, models: models || {} });
    }
    /**
     * Creates a top-level API, which is composed primarily of resources
     * and optionally an endpoint to retrieve an OpenAPI schema documenting
     * the API.
     *
     * @param resources
     * @param openapi
     * @param topLevel
     * @returns api instance
     *
     * ## Example
     * ```ts
     * // ~/api/index.ts
     *
     * import { stl } from "~/libs/stl";
     * import { users } from "./users";
     *
     * export const api = stl.api({
     *   openapi: {
     *     endpoint: "GET /api/openapi",
     *   },
     *   resources: {
     *     users,
     *   },
     * });
     * ```
     */
    api({ basePath, openapi, topLevel, resources, }) {
        var _a;
        const openapiEndpoint = (_a = openapi === null || openapi === void 0 ? void 0 : openapi.endpoint) !== null && _a !== void 0 ? _a : `GET ${basePath}/openapi`;
        const topLevelActions = (topLevel === null || topLevel === void 0 ? void 0 : topLevel.actions) || {};
        const apiDescription = {
            [apiSymbol]: true,
            basePath,
            openapi: {
                endpoint: openapiEndpoint,
            },
            topLevel: Object.assign(Object.assign({}, topLevel), { actions: topLevelActions }),
            resources: resources || {},
        };
        if (openapiEndpoint !== false) {
            topLevelActions.getOpenapi = this.endpoint({
                endpoint: openapiEndpoint,
                response: OpenAPIResponse,
                handler() {
                    return __awaiter(this, void 0, void 0, function* () {
                        return (yield openapiSpec(apiDescription));
                    });
                },
            });
        }
        // Type system is not powerful enough to understand that if statement above
        // ensures if openApi.endpoint !== false, then getOpenapi is provided
        return apiDescription;
    }
    /**
     * Converts a Typescript type to a Zod schema.
     *
     * @param schema this is generated by the `stl` CLI and should not be passed or modified manually
     * @returns schema representing type `T`
     *
     * Invocations of this method are detected by the `stl` CLI,
     * which injects a Zod schema representing the input type `T`
     * along with any necessary imports into the file. Schema generation must
     * be re-run to keep the schema up-to-date whenever `T` or any types
     * it relies on change. This can be automated via the `stl` CLI watch mode.
     *
     * For more information on using the `stl` CLI, see the
     * [CLI docs](https://stainlessapi.com/stl/cli.md).
     * For more details on advanced conversion functionality,
     * including adding custom validation and transformation logic
     * to generated schemas, see the
     * [codegen schema docs](https://stainlessapi.com/stl/schemas/schemas-from-types.md).
     *
     * ## Example
     * ```ts
     * // invoke like this
     * const partialSchema = stl.codegenSchema<Partial<{a: string}>>();
     * // `stl` converts this to
     * const partialSchema = stl.codegenSchema<Partial<{a: string}>>(z.object({a: z.string().optional()}));
     * ```
     */
    codegenSchema(schema) {
        return schema;
    }
    /**
     * Creates an endpoint.
     *
     * @param path the optional type of the path param
     * @param query the optional type of the query param
     * @param body the optional type of the body param
     * @param response the optional type of the response, defaults to `void`
     * @param endpoint a string declaring the HTTP method and URL for this endpoint
     * @param config optional configuraton
     * @param handler the function that handles requests to this endpoint
     * @returns endpoint instance
     *
     * ## Schema generation
     * Invocations of this method are detected by the `stl` CLI,
     * which generates Zod schemas for the given param and response types.
     * Schema generation must be re-run to keep the schema up-to-date whenever
     * any of these types, or the types they rely on, change. This can be automated
     * via the `stl` CLI watch mode.
     *
     * For more information on using the `stl` CLI, see the
     * [CLI docs](https://stainlessapi.com/stl/cli.md).
     * For more details on advanced conversion functionality,
     * including adding custom validation and transformation logic
     * to generated schemas, see the
     * [codegen schema docs](https://stainlessapi.com/stl/schemas/schemas-from-types.md).
     *
     * ## Example
     * ```ts
     * // ~/api/users/retrieve.ts
     * interface Path {
     *   userId: string,
     * }
     *
     * export const retrieve = stl.types<{path: Path, response: typeof User}>()
     *   .endpoint({
     *     endpoint: "GET /api/users/{userId}",
     *     async handler({ userId }, ctx) {
     *       const user = await prisma.user.findUnique({
     *         where: {
     *           id: userId,
     *         },
     *       });
     *       if (!user) throw new NotFoundError();
     *       return user;
     *     },
     *   });
     * ```
     */
    types() {
        return {
            endpoint: ({ endpoint, config, handler, }) => {
                return {
                    stl: this,
                    endpoint,
                    config: config,
                    handler,
                    path: undefined,
                    query: undefined,
                    body: undefined,
                    response: undefined,
                };
            },
        };
    }
}
//# sourceMappingURL=stl.js.map