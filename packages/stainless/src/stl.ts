import * as z from "./z";
import { openapiSpec } from "./openapiSpec";
import type { OpenAPIObject } from "zod-openapi/lib-types/openapi3-ts/dist/oas31";
export { SelectTree, parseSelect } from "./parseSelect";
export { z };
export { createClient } from "./client";
export { createRecursiveProxy } from "./createRecursiveProxy";
export type {
  StainlessClient,
  ClientPromise,
  PaginatorPromise,
  Page,
} from "./client";

export { getApiMetadata } from "./gen/getApiMetadata";

/** The standard HTTP methods, in lowercase. */
export type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head";

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

export function parseEndpoint(endpoint: HttpEndpoint): [HttpMethod, HttpPath] {
  const [method, path] = endpoint.split(/\s+/, 2);
  switch (method) {
    case "get":
    case "post":
    case "put":
    case "patch":
    case "delete":
    case "options":
    case "head":
      break;
    default:
      throw new Error(`invalid or unsupported http method: ${method}`);
  }
  if (!path.startsWith("/")) {
    throw new Error(
      `Invalid path must start with a slash (/); got: "${endpoint}"`
    );
  }
  return [method, path as HttpPath];
}

/**
 * Ensures that the input and output types are both
 * objects; plays well with z.object(...).transform(() => ({...}))
 * whereas z.AnyZodObject doesn't.
 */
// TODO: is there a z.Something for this already?
export type ZodObjectSchema = z.ZodType<object, any, object>;

/**
 * Endpoints take in `handler` methods of this type.
 *
 * @param {RequestData<Path, Query, Body>} request   request object with parsed params
 * @param {Ctx}                            ctx       context with stainless, plugin, and user-provided data
 */
export type Handler<
  Ctx,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response
> = (
  request: RequestData<Path, Query, Body>,
  ctx: Ctx
) => Response | Promise<Response>;

/**
 * Contains parsed path, query, and body params.
 */
type RequestData<
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined
> = (Path extends z.ZodTypeAny ? z.infer<Path> : {}) &
  (Query extends z.ZodTypeAny ? z.infer<Query> : {}) &
  (Body extends z.ZodTypeAny ? z.infer<Body> : {});

/**
 * An interface for plugins to optionally accept configuration
 * options on endpoints.
 *
 * When creating endpoints, users can
 * specify a `config` object of type `EndpointConfig`.
 * This allows plugins to accept custom properties.
 *
 * ```ts
 * // example-plugin.ts
 * declare module "stainless" {
 *   interface EndpointConfig {
 *     // custom configuration properties here
 *   }
 * }
 * ```
 */
export interface EndpointConfig {
  // auth etc goes here.
}

export interface BaseEndpoint<
  Config extends EndpointConfig | undefined,
  MethodAndUrl extends HttpEndpoint,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response extends z.ZodTypeAny | undefined
> {
  stl: Stl<any>;
  endpoint: MethodAndUrl;
  response: Response;
  config: Config;
  path: Path;
  query: Query;
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
  handler: Handler<
    StlContext<BaseEndpoint<Config, MethodAndUrl, Path, Query, Body, Response>>,
    Path,
    Query,
    Body,
    Response extends z.ZodTypeAny ? z.input<Response> : undefined
  >;
}

export type AnyEndpoint = Endpoint<any, any, any, any, any, any>;

export type GetEndpointMethod<E extends AnyEndpoint> =
  E["endpoint"] extends `${infer M extends HttpMethod} ${string}` ? M : never;

export type GetEndpointUrl<E extends AnyEndpoint> =
  E["endpoint"] extends `${HttpMethod} ${infer Url}` ? Url : never;

/**
 * Gets all endpoints associated with a given resource
 */
// TODO make this a method on AnyResourceConfig?
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
 * A resource configuration created on an instance of {@link Stl}.
 */
// TODO: endpoint returns Endpoint, but resource returns ResourceConfig
// maybe this should be Resource
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

/**
 * A type containing information about an API defined by the
 * {@link Stl.api} method.
 */
export type APIDescription<
  TopLevel extends ResourceConfig<AnyActionsConfig, undefined, any>,
  Resources extends Record<string, AnyResourceConfig> | undefined
> = {
  openapi: OpenAPIConfig;
  topLevel: TopLevel;
  resources: Resources;
};

export type APIMetadata = {
  actions?: Record<string, ActionMetadata>;
  namespacedResources?: Record<string, APIMetadata>;
};

export type ActionMetadata = {
  endpoint: HttpEndpoint;
};

export type AnyAPIDescription = APIDescription<any, any>;

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
   * @param statusCode the HTTP status code to resolve the request with
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
  }
}

/** When thrown in an endpoint handler, responds with HTTP status code 401. */
export class UnauthorizedError extends StlError {
  /**
   * @param response  optional data included in the body of the response JSON.
   */
  constructor(response?: Record<string, any>) {
    super(401, { error: "unauthorized", ...response });
  }
}

/** When thrown in an endpoint handler, responds with HTTP status code 403. */
export class ForbiddenError extends StlError {
  /**
   * @param response  optional data included in the body of the response JSON.
   */
  constructor(response?: Record<string, any>) {
    super(403, { error: "forbidden", ...response });
  }
}

/** When thrown in an endpoint handler, responds with HTTP status code 404. */
export class NotFoundError extends StlError {
  /**
   * @param response  optional data included in the body of the response JSON.
   */
  constructor(response?: Record<string, any>) {
    super(404, { error: "not found", ...response });
  }
}

type AnyStatics = Record<string, any>; // TODO?

/**
 * The type of a `stainless` plugin.
 */
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
export type StainlessOpts<Plugins extends AnyPlugins> = {
  /**
   * Provide plugins to customize `stainless` endpoint behavior.
   * Each plugin is named by the user, and must be of type {@link MakeStainlessPlugin}.
   * Some plugins provide context information under `ctx.plugins.{name of plugin}.
   */
  plugins: Plugins;
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
interface EndpointParams<
  MethodAndUrl extends HttpEndpoint,
  Config extends EndpointConfig | undefined,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response extends z.ZodTypeAny = z.ZodVoid
> {
  /**
   * a string declaring the HTTP method
   * and URL for this endpoint
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
  handler: Handler<
    StlContext<BaseEndpoint<Config, MethodAndUrl, Path, Query, Body, Response>>,
    Path,
    Query,
    Body,
    Response extends z.ZodTypeAny ? z.input<Response> : undefined
  >;
}

/** Parameters for {@link Stl.resource} */
interface ResourceParams<
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
interface ApiParams<
  TopLevel extends ResourceConfig<AnyActionsConfig, undefined, any>,
  Resources extends Record<string, AnyResourceConfig> | undefined
> {
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
 * For more advanced usage, see <TODO>.
 */
export class Stl<Plugins extends AnyPlugins> {
  // this gets filled in later, we just declare the type here.
  plugins = {} as ExtractStatics<Plugins>;
  private stainlessPlugins: Record<string, StainlessPlugin<any>> = {};

  /**
   *
   * @param opts {StainlessOpts<Plugins>} customize the created instance with plugins
   */
  constructor(opts: StainlessOpts<Plugins>) {
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

  /**
   * Handles an incoming request by invoking the endpoint for it.
   * This should not be called in typical use.
   * It is primarily useful for implementing a plugin for
   * integrating with an underluing server implementation.
   * For a usage example, see `../../next/src/nextPlugin.rs`.
   * @param endpoint endpoint to handle incoming request
   * @param params request params
   * @param context context with `stl` and request-specific
   * data
   * @returns request response
   */
  async execute<EC extends AnyEndpoint>(
    params: Params,
    context: StlContext<EC>
  ): Promise<ExtractExecuteResponse<EC>> {
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
      context.parsedParams.query = await context.endpoint.query
        ?.parseAsync(params.query, parseParams)
        .catch(prependZodPath("<stainless request query>"));
      context.parsedParams.path = await context.endpoint.path
        ?.parseAsync(params.path, parseParams)
        .catch(prependZodPath("<stainless request path>"));
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
    const responseInput = await context.endpoint.handler(
      { ...body, ...path, ...query },
      context as any as StlContext<EC>
    );
    const response = context.endpoint.response
      ? await context.endpoint.response.parseAsync(responseInput, parseParams)
      : undefined;

    return response;
  }

  /**
   * Creates an endpoint.
   *
   * @param endpoint
   * @param config
   * @param response
   * @param path
   * @param query
   * @param body
   * @param handler
   * @returns endpoint instance
   *
   * ## Example
   * ```ts
   * // ~/api/users/retrieve.ts
   *
   * export const retrieve = stl.endpoint({
   *   endpoint: "get /api/users/{userId}",
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
    params: EndpointParams<MethodAndUrl, Config, Path, Query, Body, Response>
  ): Endpoint<Config, MethodAndUrl, Path, Query, Body, Response> {
    const { config, response, path, query, body, ...rest } = params;
    return {
      stl: this as any,
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
  }: ResourceParams<Actions, Resources, Models>): ResourceConfig<
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
   *     endpoint: "get /api/openapi",
   *   },
   *   resources: {
   *     users,
   *   },
   * });
   * ```
   */
  api<
    TopLevel extends ResourceConfig<AnyActionsConfig, undefined, any>,
    Resources extends Record<string, AnyResourceConfig> | undefined
  >({
    openapi,
    topLevel,
    resources,
  }: ApiParams<TopLevel, Resources>): APIDescription<
    TopLevel & OpenAPITopLevel<typeof openapi>,
    Resources
  > {
    const openapiEndpoint = openapi?.endpoint ?? "get /api/openapi";
    const topLevelActions = topLevel?.actions || {};
    const apiDescription = {
      openapi: {
        endpoint: openapiEndpoint,
        get spec() {
          // TODO memoize
          return openapiSpec(apiDescription);
        },
      },
      topLevel: {
        ...topLevel,
        actions: topLevelActions,
      },
      resources: resources || {},
    } as APIDescription<TopLevel, Resources>;

    if (openapiEndpoint !== false) {
      (topLevelActions as any).getOpenapi = this.endpoint({
        endpoint: openapiEndpoint,
        response: OpenAPIResponse,
        async handler() {
          return openapiSpec(apiDescription) as any;
        },
      });
    }

    // Type system is not powerful enough to understand that if statement above
    // ensures if openApi.endpoint !== false, then getOpenapi is provided
    return apiDescription as APIDescription<
      TopLevel & OpenAPITopLevel<typeof openapi>,
      Resources
    >;
  }
}
