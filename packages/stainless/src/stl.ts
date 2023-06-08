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

export type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head";
export type HttpPath = `/${string}`;
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
 *
 * TODO: is there a z.Something for this already?
 */
export type ZodObjectSchema = z.ZodType<object, any, object>;

export type Handler<
  Ctx,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response
> = (
  request: MakeRequest<Path, Query, Body>,
  ctx: Ctx
) => Response | Promise<Response>;

type MakeRequest<
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined
> = (Path extends z.ZodTypeAny ? z.infer<Path> : {}) &
  (Query extends z.ZodTypeAny ? z.infer<Query> : {}) &
  (Body extends z.ZodTypeAny ? z.infer<Body> : {});

export interface EndpointConfig {
  // auth etc goes here.
}

export type Endpoint<
  MethodAndUrl extends HttpEndpoint,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response extends z.ZodTypeAny | undefined
> = {
  stl: Stl<any>;
  endpoint: MethodAndUrl;
  response: Response;
  config: EndpointConfig;
  path: Path;
  query: Query;
  body: Body;
  handler: Handler<
    StlCustomContext &
    StlContext<
      Endpoint<MethodAndUrl, Path, Query, Body, Response>
    >,
    Path,
    Query,
    Body,
    Response extends z.ZodTypeAny ? z.input<Response> : undefined
  >;
};

export type AnyEndpoint = Endpoint<any, any, any, any, any>;

export type GetEndpointMethod<E extends AnyEndpoint> =
  E["endpoint"] extends `${infer M extends HttpMethod} ${string}` ? M : never;

export type GetEndpointUrl<E extends AnyEndpoint> =
  E["endpoint"] extends `${HttpMethod} ${infer Url}` ? Url : never;

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
  endpoint: string | false;
  spec: OpenAPIObject;
};

export type APIDescription<
  TopLevel extends ResourceConfig<AnyActionsConfig, undefined, any>,
  Resources extends Record<string, AnyResourceConfig> | undefined
> = {
  openapi: OpenAPIConfig;
  topLevel: TopLevel;
  resources: Resources;
};

export type AnyAPIDescription = APIDescription<any, any>;
export class StlError extends Error {
  constructor(
    public statusCode: number,
    public response?: Record<string, any>
  ) {
    super(JSON.stringify(response));
  }
}

export class BadRequestError extends StlError {
  constructor(response?: Record<string, any>) {
    super(400, { error: "bad request", ...response });
  }
}
export class UnauthorizedError extends StlError {
  constructor(response?: Record<string, any>) {
    super(401, { error: "unauthorized", ...response });
  }
}
export class ForbiddenError extends StlError {
  constructor(response?: Record<string, any>) {
    super(403, { error: "forbidden", ...response });
  }
}

export class NotFoundError extends StlError {
  constructor(response?: Record<string, any>) {
    super(404, { error: "not found", ...response });
  }
}

type AnyStatics = Record<string, any>; // TODO?

export type StainlessPlugin<
  Statics extends AnyStatics | undefined = undefined
> = {
  statics?: Statics;
  middleware?: <EC extends AnyEndpoint>(
    endpoint: EC,
    params: Params,
    context: PartialStlContext<EC>
  ) => void | Promise<void>;
};

export type MakeStainlessPlugin<
  Statics extends AnyStatics | undefined = undefined,
  Plugins extends AnyPlugins = {}
> = (stl: Stl<Plugins>) => StainlessPlugin<Statics>;

type AnyPlugins = Record<string, MakeStainlessPlugin<any, any>>;

export type StainlessOpts<Plugins extends AnyPlugins> = {
  plugins: Plugins;
};

export type StainlessHeaders = Record<string, string | string[] | undefined>; // TODO

export interface StlCustomContext { }

export interface BaseStlContext<EC extends AnyEndpoint> {
  endpoint: EC; // what is the config?
  // url: URL;
  headers: StainlessHeaders;
  parsedParams?: {
    path: any;
    query: any;
    body: any;
  };
  server: {
    type: string; // eg nextjs
    args: unknown[]; // eg [req, rsp]
  };
}

export interface StlContext<EC extends AnyEndpoint>
  extends BaseStlContext<EC> { }

export type PartialStlContext<
  EC extends AnyEndpoint
> = BaseStlContext<EC> & Partial<StlCustomContext> & Partial<StlContext<EC>>;

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

export type OpenAPIEndpoint = Endpoint<
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

export class Stl<Plugins extends AnyPlugins> {
  // this gets filled in later, we just declare the type here.
  plugins = {} as ExtractStatics<Plugins>;
  private stainlessPlugins: Record<string, StainlessPlugin<any>> =
    {};

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
  initContext<EC extends AnyEndpoint>(
    c: PartialStlContext<EC>
  ): PartialStlContext<EC> {
    return c;
  }

  initParams(p: Params) {
    return p;
  }

  async execute<EC extends AnyEndpoint>(
    endpoint: EC,
    params: Params,
    context: PartialStlContext<EC>
  ): Promise<ExtractExecuteResponse<EC>> {
    for (const plugin of Object.values(this.stainlessPlugins)) {
      const middleware = plugin.middleware;
      if (middleware) await middleware(endpoint, params, context);
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
      context.parsedParams.query = await endpoint.query
        ?.parseAsync(params.query, parseParams)
        .catch(prependZodPath("<stainless request query>"));
      context.parsedParams.path = await endpoint.path
        ?.parseAsync(params.path, parseParams)
        .catch(prependZodPath("<stainless request path>"));
      context.parsedParams.body = await endpoint.body
        ?.parseAsync(params.body, parseParams)
        .catch(prependZodPath("<stainless request body>"));
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestError({ issues: error.issues });
      }
      throw error;
    }

    const { query, path, body } = context.parsedParams;
    const responseInput = await endpoint.handler(
      { ...body, ...path, ...query },
      context as any as StlContext<EC>
    );
    const response = endpoint.response
      ? await endpoint.response.parseAsync(responseInput, parseParams)
      : undefined;

    return response;
  }

  endpoint<
    MethodAndUrl extends HttpEndpoint,
    Path extends ZodObjectSchema | undefined,
    Query extends ZodObjectSchema | undefined,
    Body extends ZodObjectSchema | undefined,
    Response extends z.ZodTypeAny = z.ZodVoid
  >({
    config,
    response,
    path,
    query,
    body,
    ...rest
  }: {
    endpoint: MethodAndUrl;
    config?: EndpointConfig;
    response?: Response;
    path?: Path;
    query?: Query;
    body?: Body;
    handler: Handler<
      StlCustomContext &
      StlContext<
        Endpoint<MethodAndUrl, Path, Query, Body, Response>
      >,
      Path,
      Query,
      Body,
      Response extends z.ZodTypeAny ? z.input<Response> : undefined
    >;
  }): Endpoint<MethodAndUrl, Path, Query, Body, Response> {
    return {
      stl: this as any,
      config: config as EndpointConfig,
      response: (response || z.void()) as Response,
      path: path as Path,
      query: query as Query,
      body: body as Body,
      ...rest,
    };
  }

  resource<
    Actions extends AnyActionsConfig | undefined,
    Resources extends Record<string, ResourceConfig<any, any, any>> | undefined,
    Models extends Record<string, z.ZodTypeAny> | undefined
  >({
    actions,
    namespacedResources,
    models,
    ...config
  }: {
    summary: string;
    internal?: boolean;
    actions?: Actions;
    namespacedResources?: Resources;
    models?: Models;
  }): ResourceConfig<Actions, Resources, Models> {
    return {
      ...config,
      actions: actions || {},
      namespacedResources: namespacedResources || {},
      models: models || {},
    } as ResourceConfig<Actions, Resources, Models>;
  }

  api<
    TopLevel extends ResourceConfig<AnyActionsConfig, undefined, any>,
    Resources extends Record<string, AnyResourceConfig> | undefined
  >({
    openapi,
    topLevel,
    resources,
  }: {
    openapi?: {
      endpoint?: HttpEndpoint | false;
    };
    topLevel?: TopLevel;
    resources?: Resources;
  }): APIDescription<TopLevel & OpenAPITopLevel<typeof openapi>, Resources> {
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
