import * as z from "./z";
import { openapiSpec } from "./openapiSpec";
import type { OpenAPIObject } from "zod-openapi/lib-types/openapi3-ts/dist/oas31";
import coerceParams from "./coerceParams";
export { type SelectTree, parseSelect } from "./parseSelect";
export { z };
export { createClient } from "./client";
export { createRecursiveProxy } from "./createRecursiveProxy";
export {
  type StainlessClient,
  type CreateClientOptions,
  ClientPromise,
  type ClientPromiseProps,
  PaginatorPromise,
  type Page,
  type RequestOptions,
} from "./client";
export { getApiRouteMap } from "./gen/getApiRouteMap";

/** The standard HTTP methods, in lowercase. */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

/**
 * A type for a string representing an HTTP path.
 * Must begin with a leading `/`.
 */
export type HttpPath = `/${string}`;

/**
 * Defines the HTTP method and path by which an endpoint
 * is accessed.
 */
export type HttpEndpoint = `${HttpMethod} ${HttpPath}`;

export type GetEndpointMethod<E extends AnyEndpoint> = GetHttpEndpointMethod<
  E["endpoint"]
>;

export type GetHttpEndpointMethod<E extends HttpEndpoint> =
  E extends `${infer M extends HttpMethod} ${string}` ? M : never;

export type GetEndpointUrl<E extends AnyEndpoint> = GetHttpEndpointUrl<
  E["endpoint"]
>;

export type GetHttpEndpointUrl<E extends HttpEndpoint> =
  E extends `${HttpMethod} ${infer Url}` ? Url : never;

export function parseEndpoint<E extends HttpEndpoint>(
  endpoint: E
): [GetHttpEndpointMethod<E>, GetHttpEndpointUrl<E>] {
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
    throw new Error(
      `Invalid path must start with a slash (/); got: "${endpoint}"`
    );
  }
  return [method as GetHttpEndpointMethod<E>, path as GetHttpEndpointUrl<E>];
}

/**
 * Ensures that the input and output types are both
 * objects; plays well with z.object(...).transform(() => ({...}))
 * whereas z.AnyZodObject doesn't.
 */
export type ZodObjectSchema = z.ZodType<object, any, object>;

/**
 * Endpoints take in `handler` methods of this type.
 */
export type Handler<
  Ctx,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response
> = (
  /** request object with parsed params */
  request: RequestData<Path, Query, Body>,
  /** context with stainless, plugin, and user-provided data */
  ctx: Ctx
) => Response | Promise<Response>;

/**
 * An object merging properties from path, query, and body params
 */
export type RequestData<
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined
> = (Path extends z.ZodTypeAny ? z.infer<Path> : {}) &
  (Query extends z.ZodTypeAny ? z.infer<Query> : {}) &
  (Body extends z.ZodTypeAny ? z.infer<Body> : {});

/**
 * An interface for per-endpoint configuration, accessible to and extendable by
 * plugins/middleware.
 *
 * When creating endpoints, users can specify a `config` object of
 * type `EndpointConfig`. This allows plugins to accept custom properties.
 *
 * ```ts
 * // example-plugin.ts
 * declare module "stainless" {
 *   // This interface must be declared within the "stainless" module
 *   interface EndpointConfig {
 *   rateLimit?: number,
 *   }
 * }
 *
 * // api/users/retrieve.ts
 *
 * stl.endpoint(
 *   endpoint: "GET /api/users/{userId}",
 *   response: User,
 *   config: {
 *     rateLimit: 10,
 *   },
 *   ...
 *   }
 * )
 * ```
 */
export interface EndpointConfig {
  // auth etc goes here.
}

const coercedPath = Symbol("coercedPath");
const coercedQuery = Symbol("coercedQuery");

export interface BaseEndpoint<
  Config extends EndpointConfig | undefined,
  MethodAndUrl extends HttpEndpoint,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response extends z.ZodTypeAny | undefined
> {
  stl: Stl<any>;
  summary?: string;
  endpoint: MethodAndUrl;
  response: Response;
  config: Config;
  path: Path;
  [coercedPath]?: Path;
  query: Query;
  [coercedQuery]?: Query;
  body: Body;
}

export type AnyBaseEndpoint = BaseEndpoint<any, any, any, any, any, any>;

/**
 * An endpoint created on an instance of {@link Stl} via the
 * {@link Stl.endpoint} method.
 */
export interface Endpoint<
  Config extends EndpointConfig | undefined,
  MethodAndUrl extends HttpEndpoint,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response extends z.ZodTypeAny | undefined
> extends BaseEndpoint<Config, MethodAndUrl, Path, Query, Body, Response> {
  handler?: Handler<
    StlContext<BaseEndpoint<Config, MethodAndUrl, Path, Query, Body, Response>>,
    Path,
    Query,
    Body,
    Response extends z.ZodTypeAny ? z.input<Response> : undefined
  >;
}

export type AnyEndpoint = Endpoint<any, any, any, any, any, any>;

export type EndpointPathInput<E extends AnyEndpoint> =
  E["path"] extends z.ZodTypeAny ? z.input<E["path"]> : undefined;
export type EndpointPathOutput<E extends AnyEndpoint> =
  E["path"] extends z.ZodTypeAny ? z.output<E["path"]> : undefined;

export type EndpointQueryInput<E extends AnyEndpoint> =
  E["query"] extends z.ZodTypeAny ? z.input<E["query"]> : undefined;
export type EndpointQueryOutput<E extends AnyEndpoint> =
  E["query"] extends z.ZodTypeAny ? z.output<E["query"]> : undefined;
export type EndpointHasRequiredQuery<E extends AnyEndpoint> =
  E["query"] extends z.ZodTypeAny
    ? {} extends EndpointQueryInput<E>
      ? false
      : true
    : false;

export type EndpointBodyInput<E extends AnyEndpoint> =
  E["body"] extends z.ZodTypeAny ? z.input<E["body"]> : undefined;
export type EndpointBodyOutput<E extends AnyEndpoint> =
  E["body"] extends z.ZodTypeAny ? z.output<E["body"]> : undefined;

export type EndpointResponseInput<E extends AnyEndpoint> =
  E["response"] extends z.ZodTypeAny ? z.input<E["response"]> : undefined;
export type EndpointResponseOutput<E extends AnyEndpoint> =
  E["response"] extends z.ZodTypeAny ? z.output<E["response"]> : undefined;

/**
 * Gets all endpoints associated with a given resource
 */
export function allEndpoints(
  resource:
    | AnyResourceConfig
    | Pick<AnyResourceConfig, "actions" | "namespacedResources">
): AnyEndpoint[] {
  return [
    ...Object.keys(resource.actions || {})
      .map((k) => resource.actions[k])
      .filter(Boolean),
    ...Object.keys(resource.namespacedResources || {}).flatMap((k) =>
      allEndpoints(resource.namespacedResources[k])
    ),
  ];
}

export type AnyActionsConfig = Record<string, AnyEndpoint | null>;

/**
 * A resource configuration created by {@link Stl.resource}.
 */
export type ResourceConfig<
  Actions extends AnyActionsConfig | undefined,
  NamespacedResources extends
    | Record<string, ResourceConfig<any, any, any>>
    | undefined,
  Models extends Record<string, z.ZodTypeAny> | undefined
> = {
  summary: string;
  internal?: boolean;

  actions: Actions;
  namespacedResources: NamespacedResources;
  models: Models;
};

export type AnyResourceConfig = ResourceConfig<any, any, any>;

type OpenAPIConfig = {
  endpoint: HttpEndpoint | false;
  spec: OpenAPIObject;
};

export const apiSymbol = Symbol("api");

export function isAPIDescription(value: unknown): value is AnyAPIDescription {
  return (value as any)?.[apiSymbol] === true;
}

/**
 * A type containing information about an API defined by the
 * {@link Stl.api} method.
 */
export type APIDescription<
  BasePath extends HttpPath,
  TopLevel extends ResourceConfig<AnyActionsConfig, undefined, any> | undefined,
  Resources extends Record<string, AnyResourceConfig> | undefined
> = {
  [apiSymbol]: true;
  basePath: BasePath;
  openapi: OpenAPIConfig;
  topLevel: TopLevel;
  resources: Resources;
};

export type APIRouteMap = {
  actions?: Record<string, RouteMapAction>;
  namespacedResources?: Record<string, APIRouteMap>;
};

export type RouteMapAction = {
  endpoint: HttpEndpoint;
};

export type AnyAPIDescription = APIDescription<any, any, any>;

export const isStlError = (value: unknown): value is StlError => {
  return value instanceof StlError || (value as any)?._isStlError === true;
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
  _isStlError = true;

  /**
   * @param statusCode
   * @param response optional data included in the body of the response JSON.
   */
  constructor(
    public statusCode: number,
    public response?: Record<string, any>
  ) {
    super(JSON.stringify(response));
  }
}

/** When thrown in an endpoint handler, responds with HTTP status code 400. */
export class BadRequestError extends StlError {
  /**
   * @param response  optional data included in the body of the response JSON.
   */
  constructor(response?: Record<string, any>) {
    super(400, { error: "bad request", ...response });
    Object.setPrototypeOf(this, StlError.prototype);
  }
}

/** When thrown in an endpoint handler, responds with HTTP status code 401. */
export class UnauthorizedError extends StlError {
  /**
   * @param response  optional data included in the body of the response JSON.
   */
  constructor(response?: Record<string, any>) {
    super(401, { error: "unauthorized", ...response });
    Object.setPrototypeOf(this, StlError.prototype);
  }
}

/** When thrown in an endpoint handler, responds with HTTP status code 403. */
export class ForbiddenError extends StlError {
  /**
   * @param response  optional data included in the body of the response JSON.
   */
  constructor(response?: Record<string, any>) {
    super(403, { error: "forbidden", ...response });
    Object.setPrototypeOf(this, StlError.prototype);
  }
}

/** When thrown in an endpoint handler, responds with HTTP status code 404. */
export class NotFoundError extends StlError {
  /**
   * @param response  optional data included in the body of the response JSON.
   */
  constructor(response?: Record<string, any>) {
    super(404, { error: "not found", ...response });
    Object.setPrototypeOf(this, StlError.prototype);
  }
}

type AnyStatics = Record<string, any>; // TODO?

export type StainlessPlugin<
  Statics extends AnyStatics | undefined = undefined
> = {
  /**
   * Optionally provide data to every endpoint handler.
   * This will be available under {@link StlContext.plugins},
   * under the field with the user's name for the plugin.
   */
  statics?: Statics;
  /**
   * Optionally inject middleware on each endpoint handler
   * to customize their behavior.
   * @param params parsed parameters of the request
   * @param context request context, potentially including
   * endpoint-specific configuration
   */
  middleware?: <EC extends AnyEndpoint>(
    params: Params,
    context: StlContext<EC>
  ) => void | Promise<void>;
};

/**
 * An interface allowing `stainless` to initialize plugins
 * passed to the {@link Stl} constructor's `plugins` parameter.
 */
export type MakeStainlessPlugin<
  Statics extends AnyStatics | undefined = undefined,
  Plugins extends AnyPlugins = {}
> = (stl: Stl<Plugins>) => StainlessPlugin<Statics>;

type AnyPlugins = Record<string, MakeStainlessPlugin<any, any>>;

/**
 * Options for customizing the behavior of an {@link Stl} instance.
 */
export type CreateStlOptions<Plugins extends AnyPlugins> = {
  /**
   * Provide plugins to customize `stainless` endpoint behavior.
   * Each plugin is named by the user, and must be of type {@link MakeStainlessPlugin}.
   * Some plugins provide context information under `ctx.plugins.{name of plugin}.
   */
  plugins: Plugins;
  /**
   * Injects generated schemas into the `stl` instance.
   * `typeSchemas` is exported from the module where you're configured
   * codegen schemas to generate in. By default, this is `stl-api-gen`.
   */
  typeSchemas?: TypeSchemas;
};

/** The raw headers provided on a request. */
export type StainlessHeaders = Record<string, string | string[] | undefined>; // TODO

/**
 * An interface for extending base stainless context information
 * with additional data.
 *
 * In order to extend stainless context, declare an instance of
 * `StlCustomContext` within the `stainless` module:
 * ```ts
 * declare module "stainless" {
 *   interface StlCustomContext {
 *     // custom context data here
 *   }
 * }
 * ```
 */
export interface StlCustomContext {}

export interface BaseStlContext<EC extends AnyBaseEndpoint> {
  /** The current endpoint being processed. */
  endpoint: EC; // what is the config?
  // url: URL;
  /** The raw headers passed to the current request. */
  headers: StainlessHeaders;
  /** The parsed path, query, and body parameters of the current request. */
  parsedParams?: {
    path: any;
    query: any;
    body: any;
  };
  /**
   * Raw server request data and information.
   * This will depend on the underlying server implementation
   * being used to serve the request, like Next.js or Express. */
  server: {
    type: string; // eg nextjs
    args: unknown[]; // eg [req, rsp]
  };
}

/**
 * Request data provided to an endpoint. This includes things like
 * request parameters and data injected by plugin middleware.
 */
export interface StlContext<EC extends AnyBaseEndpoint>
  extends BaseStlContext<EC>,
    StlCustomContext {}

/** Parsed, but untyped, parameters provided to an endpoint. */
export interface Params {
  path: any;
  query: any;
  body: any;
  headers: any;
}

type ExtractStatics<Plugins extends AnyPlugins> = {
  [Name in PluginsWithStaticsKeys<Plugins>]: NonNullable<
    ReturnType<Plugins[Name]>["statics"]
  >;
};

/**
 * Provides static data created by plugins to
 * endpoint request handlers.
 */
export type PluginsWithStaticsKeys<Plugins extends AnyPlugins> = {
  [k in keyof Plugins]: NonNullable<
    ReturnType<Plugins[k]>["statics"]
  > extends never
    ? never
    : k;
}[keyof Plugins];

type ExtractExecuteResponse<EC extends AnyEndpoint> =
  EC["response"] extends z.ZodTypeAny ? z.infer<EC["response"]> : undefined;

export const OpenAPIResponse = z.object({}).passthrough();
export type OpenAPIResponse = z.infer<typeof OpenAPIResponse>;

/** Type of an endpoint serving OpenAPI schema data. */
export type OpenAPIEndpoint = Endpoint<
  any,
  any,
  undefined,
  undefined,
  undefined,
  typeof OpenAPIResponse
>;

const prependZodPath = (path: string) => (error: any) => {
  if (error instanceof z.ZodError) {
    for (const issue of error.issues) {
      issue.path.unshift(path);
    }
  }
  throw error;
};

/** Extension of top-level API to include serving OpenAPI schema data. */
type OpenAPITopLevel<
  openapi extends
    | {
        endpoint?: HttpEndpoint | false;
      }
    | undefined
> = openapi extends {
  endpoint: false;
}
  ? {}
  : { actions: { getOpenapi: OpenAPIEndpoint } };

/** Parameters for {@link Stl.endpoint}. */
interface CreateEndpointOptions<
  MethodAndUrl extends HttpEndpoint,
  Config extends EndpointConfig | undefined,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response extends z.ZodTypeAny = z.ZodVoid
> {
  /**
   * a string declaring the HTTP method
   * and URL for this endpoint, e.g. `"GET /items/{id}"`
   */
  endpoint: MethodAndUrl;
  /** Optional plugin configuration specific to the endpoint. */
  config?: Config;
  /** The schema for the response defining its properties. */
  response?: Response;
  /** The schema for the path parameters. */
  path?: Path;
  /** The schema for the query (search) parameters. */
  query?: Query;
  /** The schema for the body parameters. */
  body?: Body;
  /**
   * The function that handles requests to the `endpoint`.
   * Called with an object holding a combination of the endpoint's
   * path, query, and body params, and an {@link StlContext} holding
   * additional global and plugin- and endpoint-specific context.
   */
  handler?: Handler<
    StlContext<BaseEndpoint<Config, MethodAndUrl, Path, Query, Body, Response>>,
    Path,
    Query,
    Body,
    Response extends z.ZodTypeAny ? z.input<Response> : undefined
  >;
}

/** Parameters for {@link Stl.resource} */
interface CreateResourceOptions<
  Actions extends AnyActionsConfig | undefined,
  Resources extends Record<string, ResourceConfig<any, any, any>> | undefined,
  Models extends Record<string, z.ZodTypeAny> | undefined
> {
  /**
   * A summary describing the resource;
   * included in the generated OpenAPI schema.
   */
  summary: string;
  /** TODO what does this do, we don't use it for anything... */
  internal?: boolean;
  /** An object of endpoints for performing methods on the resource. */
  actions?: Actions;
  /** An object of sub-resources of the resource. */
  namespacedResources?: Resources;
  /** An object of named models; values must be response schemas. */
  models?: Models;
}

/** Parameters for {@link Stl.api} */
interface CreateApiOptions<
  BasePath extends HttpPath,
  TopLevel extends
    | ResourceConfig<AnyActionsConfig, undefined, any>
    | undefined = undefined,
  Resources extends Record<string, AnyResourceConfig> | undefined = undefined
> {
  basePath: BasePath;
  /**
   * Optionally configure an endpoint for retrieving the API's
   * generated OpenAPI schema.
   */
  openapi?: {
    /**
     * The endpoint for serving the OpenAPI schema,
     * or `false` to disable schema serving.
     */
    endpoint?: HttpEndpoint | false;
  };

  /**
   * Add endpoints directly onto the API, without utilizing the
   * resource abstraction. This should be used sparingly,
   * as resourceless endpoints are less idiomatic and may result in
   * less organized SDKs if misused.
   */
  topLevel?: TopLevel;
  /** An object containing the resources of which the API is composed. */
  resources?: Resources;
}

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
export class Stl<Plugins extends AnyPlugins> {
  // this gets filled in later, we just declare the type here.
  plugins = {} as ExtractStatics<Plugins>;
  private stainlessPlugins: Record<string, StainlessPlugin<any>> = {};
  private typeSchemas?: TypeSchemas;

  /**
   *
   * @param opts {CreateStlOptions<Plugins>} customize the created instance with plugins
   */
  constructor(opts: CreateStlOptions<Plugins>) {
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
  initContext<EC extends AnyEndpoint>(c: StlContext<EC>): StlContext<EC> {
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
  initParams(p: Params) {
    return p;
  }

  async loadEndpointTypeSchemas(endpoint: AnyEndpoint): Promise<void> {
    if (
      !endpoint.query &&
      !endpoint.path &&
      !endpoint.body &&
      !endpoint.response
    ) {
      if (!this.typeSchemas) {
        throw new Error(
          "Failed to provide `typeSchemas` to stl instance while using codegen schemas"
        );
      }
      try {
        const schemas = await this.typeSchemas[endpoint.endpoint]?.();
        if (schemas) {
          endpoint.path = schemas.path;
          endpoint.query = schemas.query;
          endpoint.body = schemas.body;
          endpoint.response = schemas.response;
        } else {
          throw new Error(
            "error encountered while handling endpoint " +
              endpoint.endpoint +
              ": no schema found. run the `stl` cli on the project to generate the schema for the endpoint."
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
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
  async parseParams<EC extends AnyEndpoint>(
    params: Params,
    context: StlContext<EC>
  ): Promise<RequestData<EC["path"], EC["query"], EC["body"]>> {
    return (await this.parseParamsWithContext(params, context))[0];
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
  async parseParamsWithContext<EC extends AnyEndpoint>(
    params: Params,
    context: StlContext<EC>
  ): Promise<
    [RequestData<EC["path"], EC["query"], EC["body"]>, StlContext<EC>]
  > {
    await this.loadEndpointTypeSchemas(context.endpoint);

    for (const plugin of Object.values(this.stainlessPlugins)) {
      const middleware = plugin.middleware;
      if (middleware) await middleware(params, context);
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
        context.endpoint[coercedQuery] ??= coerceParams(context.endpoint.query);
        context.parsedParams.query = await context.endpoint[coercedQuery]
          .parseAsync(params.query, parseParams)
          .catch(prependZodPath("<stainless request query>"));
      }
      if (context.endpoint.path) {
        context.endpoint[coercedPath] ??= coerceParams(context.endpoint.path);
        context.parsedParams.path = await context.endpoint[coercedPath]
          .parseAsync(params.path, parseParams)
          .catch(prependZodPath("<stainless request path>"));
      }
      context.parsedParams.body = await context.endpoint.body
        ?.parseAsync(params.body, parseParams)
        .catch(prependZodPath("<stainless request body>"));
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestError({ issues: error.issues });
      }
      throw error;
    }

    const { query, path, body } = context.parsedParams;
    return [{ ...path, ...query, ...body }, context] as any;
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
  async execute<EC extends AnyEndpoint>(
    params: Params,
    context: StlContext<EC>
  ): Promise<ExtractExecuteResponse<EC>> {
    const { endpoint } = context;
    if (!endpoint.handler) {
      throw new Error(`no endpoint handler defined`);
    }

    const [request, ctx] = await this.parseParamsWithContext(params, context);

    const responseInput = await endpoint.handler(request, ctx);

    const parseParams = {
      stlContext: ctx,
    };

    const response = endpoint.response
      ? await endpoint.response.parseAsync(responseInput, parseParams)
      : undefined;

    return response;
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
  endpoint<
    MethodAndUrl extends HttpEndpoint,
    Config extends EndpointConfig | undefined,
    Path extends ZodObjectSchema | undefined,
    Query extends ZodObjectSchema | undefined,
    Body extends ZodObjectSchema | undefined,
    Response extends z.ZodTypeAny = z.ZodVoid
  >(
    params: CreateEndpointOptions<
      MethodAndUrl,
      Config,
      Path,
      Query,
      Body,
      Response
    >
  ): Endpoint<Config, MethodAndUrl, Path, Query, Body, Response> {
    const { config, response, path, query, body, ...rest } = params;
    return {
      stl: this,
      config: config as Config,
      response: (response || z.void()) as Response,
      path: path as Path,
      query: query as Query,
      body: body as Body,
      ...rest,
    };
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
  resource<
    Actions extends AnyActionsConfig | undefined,
    Resources extends Record<string, ResourceConfig<any, any, any>> | undefined,
    Models extends Record<string, z.ZodTypeAny> | undefined
  >({
    actions,
    namespacedResources,
    models,
    ...config
  }: CreateResourceOptions<Actions, Resources, Models>): ResourceConfig<
    Actions,
    Resources,
    Models
  > {
    return {
      ...config,
      actions: actions || {},
      namespacedResources: namespacedResources || {},
      models: models || {},
    } as ResourceConfig<Actions, Resources, Models>;
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
  api<
    BasePath extends HttpPath,
    TopLevel extends
      | ResourceConfig<AnyActionsConfig, undefined, any>
      | undefined = undefined,
    Resources extends Record<string, AnyResourceConfig> | undefined = undefined
  >({
    basePath,
    openapi,
    topLevel,
    resources,
  }: CreateApiOptions<BasePath, TopLevel, Resources>): APIDescription<
    BasePath,
    TopLevel extends AnyResourceConfig
      ? TopLevel & OpenAPITopLevel<typeof openapi>
      : OpenAPITopLevel<typeof openapi> &
          ResourceConfig<{}, undefined, undefined>,
    Resources
  > {
    const openapiEndpoint = openapi?.endpoint ?? `GET ${basePath}/openapi`;
    const topLevelActions = topLevel?.actions || {};
    const apiDescription = {
      [apiSymbol]: true,
      basePath,
      openapi: {
        endpoint: openapiEndpoint,
      },
      topLevel: {
        ...topLevel,
        actions: topLevelActions,
      },
      resources: resources || {},
    } as APIDescription<BasePath, TopLevel, Resources>;

    if (openapiEndpoint !== false) {
      (topLevelActions as any).getOpenapi = this.endpoint({
        endpoint: openapiEndpoint,
        response: OpenAPIResponse,
        async handler() {
          return (await openapiSpec(apiDescription)) as any;
        },
      });
    }

    // Type system is not powerful enough to understand that if statement above
    // ensures if openApi.endpoint !== false, then getOpenapi is provided
    return apiDescription as APIDescription<
      BasePath,
      TopLevel extends AnyResourceConfig
        ? TopLevel & OpenAPITopLevel<typeof openapi>
        : OpenAPITopLevel<typeof openapi> &
            ResourceConfig<{}, undefined, undefined>,
      Resources
    >;
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
  codegenSchema<T>(schema: z.ZodTypeAny): z.toZod<T> {
    return schema as any;
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
  types<T extends Types>(): TypeEndpointBuilder<
    TypeArgToZodObject<T, "path">,
    TypeArgToZodObject<T, "query">,
    TypeArgToZodObject<T, "body">,
    "response" extends keyof T ? z.toZod<T["response"]> : z.ZodVoid
  > {
    type Path = TypeArgToZodObject<T, "path">;
    type Query = TypeArgToZodObject<T, "query">;
    type Body = TypeArgToZodObject<T, "body">;
    type Response = "response" extends keyof T
      ? z.toZod<T["response"]>
      : z.ZodVoid;
    return {
      endpoint: <
        MethodAndUrl extends HttpEndpoint,
        Config extends EndpointConfig | undefined
      >({
        endpoint,
        config,
        handler,
      }: TypeEndpointParams<
        MethodAndUrl,
        Config,
        Path,
        Query,
        Body,
        Response
      >): Endpoint<Config, MethodAndUrl, Path, Query, Body, Response> => {
        return {
          stl: this,
          endpoint,
          config: config as Config,
          handler,
          path: undefined as Path,
          query: undefined as Query,
          body: undefined as Body,
          response: undefined as any as Response,
        };
      },
    };
  }
}

type TypeArgToZod<T extends Types, K extends keyof Types> = K extends keyof T
  ? z.toZod<T[K]>
  : undefined;

type TypeArgToZodObject<
  T extends Types,
  K extends keyof Types
> = K extends keyof T
  ? z.toZod<T[K]> extends infer U extends ZodObjectSchema
    ? U
    : undefined
  : undefined;

interface Types {
  path?: object;
  query?: object;
  body?: object;
  response?: any;
}

interface TypeEndpointParams<
  MethodAndUrl extends HttpEndpoint,
  Config extends EndpointConfig | undefined,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response extends z.ZodTypeAny = z.ZodVoid
> {
  endpoint: MethodAndUrl;
  config?: Config;
  handler?: Handler<
    StlContext<BaseEndpoint<Config, MethodAndUrl, Path, Query, Body, Response>>,
    Path,
    Query,
    Body,
    Response extends z.ZodTypeAny ? z.input<Response> : undefined
  >;
}

interface TypeEndpointBuilder<
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response extends z.ZodTypeAny = z.ZodVoid
> {
  endpoint<
    MethodAndUrl extends HttpEndpoint,
    Config extends EndpointConfig | undefined
  >(
    params: TypeEndpointParams<
      MethodAndUrl,
      Config,
      Path,
      Query,
      Body,
      Response
    >
  ): Endpoint<Config, MethodAndUrl, Path, Query, Body, Response>;
}

export type TypeSchemas = Record<
  string,
  () => Promise<{
    path?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    body?: z.ZodTypeAny;
    response?: z.ZodTypeAny;
  }>
>;
