import {
  StainlessMetadata,
  WithStainlessMetadata,
  ExtractStainlessMetadata,
  extendZodForStl,
  getStainlessMetadata,
} from "./stlZodExtensions";
export {
  StainlessMetadata,
  WithStainlessMetadata,
  ExtractStainlessMetadata,
  extendZodForStl,
  getStainlessMetadata,
};
export {
  Selectable,
  Expandable,
  StlTransform,
  StlParseContext,
  StlRefinementCtx,
  StlParseParams,
} from "./stlZodExtensions";
import { z } from "zod";
import qs from "qs";
import { selectParam } from "./selectParam";
import { expandParam } from "./expandParam";
export { expandParamOptions } from "./expandParam";
import { openapiSpec } from "./openapiSpec";
import { type OpenAPIObject } from "openapi3-ts";
import { once } from "lodash";
export { SelectTree, parseSelect } from "./parseSelect";

/**
 * TODO: try to come up with a better error message
 * that you must import stl _before_ zod
 * in any file that uses z.openapi(),
 * including the file that calls stl.openapiSpec().
 */
extendZodForStl(z); // https://github.com/asteasolutions/zod-to-openapi#the-openapi-method

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
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
  UserContext extends object,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response extends z.ZodTypeAny | undefined
> = {
  endpoint: HttpEndpoint;
  config: EndpointConfig;
  path: Path;
  query: Query;
  body: Body;
  response: Response;
  handler: Handler<
    UserContext &
      StlContext<Endpoint<UserContext, Path, Query, Body, Response>>,
    Path,
    Query,
    Body,
    Response extends z.ZodTypeAny ? z.input<Response> : undefined
  >;
};

export type AnyEndpoint = Endpoint<any, any, any, any, any>;

type Routes = Record<string, AnyEndpoint>;

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

type AnyActionsConfig = Record<string, AnyEndpoint | null>;

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

export type APIDescription<
  TopLevel extends ResourceConfig<AnyActionsConfig, undefined, any>,
  Resources extends Record<string, AnyResourceConfig> | undefined
> = {
  openapi: {
    endpoint: string | false;
    spec: OpenAPIObject;
  };
  topLevel: TopLevel;
  resources: Resources;
};

export type AnyAPIDescription = APIDescription<any, any>;

function response<T extends z.ZodTypeAny, M extends StainlessMetadata = {}>(
  schema: T,
  metadata: M = {} as any
): WithStainlessMetadata<T, M> {
  return schema.stlMetadata(metadata);
}

const commonPageResponseFields = {
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
  hasNextPage: z.boolean().optional(),
  hasPreviousPage: z.boolean().optional(),
};

class PageResponseWrapper<I extends z.ZodTypeAny> {
  wrapped(item: I) {
    return z.object({
      ...commonPageResponseFields,
      items: z.array(item),
    });
  }
}

function pageResponse<I extends z.ZodTypeAny, M extends StainlessMetadata = {}>(
  item: I,
  metadata: M = {} as any
): WithStainlessMetadata<
  ReturnType<PageResponseWrapper<I>["wrapped"]>,
  M & { pageResponse: true }
> {
  return z
    .object({
      ...commonPageResponseFields,
      items: z.array(item),
    })
    .stlMetadata({ ...metadata, pageResponse: true });
}

export type PageData<I> = {
  items: I[];
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
};

export type PageItemType<D extends PageData<any>> = D["items"][number];

export const AnyPageData: z.ZodType<
  PageData<any>,
  any,
  PageData<any>
> = z.object({
  items: z.array(z.any()),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
  hasNextPage: z.boolean().optional(),
  hasPreviousPage: z.boolean().optional(),
});

export const SortDirection = z.union([z.literal("asc"), z.literal("desc")]);
export type SortDirection = z.infer<typeof SortDirection>;

export const PaginationParams = z.object({
  pageAfter: z.string().optional(),
  pageBefore: z.string().optional(),
  pageSize: z.coerce.number().positive(),
  sortBy: z.string(),
  sortDirection: SortDirection.default("asc"),
});

export type PaginationParams = z.infer<typeof PaginationParams>;

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
  UserContext extends object,
  Statics extends AnyStatics | undefined = undefined
> = {
  statics?: Statics;
  middleware?: <EC extends AnyEndpoint>(
    endpoint: EC,
    params: Params,
    context: PartialStlContext<UserContext, EC>
  ) => void | Promise<void>;
};

export type MakeStainlessPlugin<
  UserContext extends object,
  Statics extends AnyStatics | undefined = undefined,
  Plugins extends AnyPlugins = {}
> = (stl: Stl<UserContext, Plugins>) => StainlessPlugin<UserContext, Statics>;

type AnyPlugins = Record<string, MakeStainlessPlugin<any, any>>;

export type StainlessOpts<Plugins extends AnyPlugins> = {
  plugins: Plugins;
};

export type StainlessHeaders = Record<string, string | string[] | undefined>; // TODO

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
  extends BaseStlContext<EC> {}

export type PartialStlContext<
  UserContext extends object,
  EC extends AnyEndpoint
> = BaseStlContext<EC> & Partial<UserContext> & Partial<StlContext<EC>>;

export interface Params {
  path: any;
  query: any;
  body: any;
  headers: any;
}

export type ExtractStatics<Plugins extends AnyPlugins> = {
  [Name in keyof Plugins]: NonNullable<ReturnType<Plugins[Name]>["statics"]>;
};

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

export type Stl<UserContext extends object, Plugins extends AnyPlugins> = {
  plugins: ExtractStatics<Plugins>;
  initContext: <EC extends AnyEndpoint>(
    c: PartialStlContext<UserContext, EC>
  ) => PartialStlContext<UserContext, EC>;
  initParams: (p: Params) => Params;
  execute: <EC extends AnyEndpoint>(
    endpoint: EC,
    params: Params,
    context: PartialStlContext<UserContext, EC>
  ) => Promise<ExtractExecuteResponse<EC>>;

  endpoint: <
    Path extends ZodObjectSchema | undefined,
    Query extends ZodObjectSchema | undefined,
    Body extends ZodObjectSchema | undefined,
    Response extends z.ZodTypeAny = z.ZodVoid
  >(options: {
    endpoint: HttpEndpoint;
    path?: Path;
    query?: Query;
    body?: Body;
    response?: Response;
    handler: Handler<
      UserContext &
        StlContext<Endpoint<UserContext, Path, Query, Body, Response>>,
      Path,
      Query,
      Body,
      Response extends z.ZodTypeAny ? z.input<Response> : undefined
    >;
  }) => Endpoint<UserContext, Path, Query, Body, Response>;

  resource: <
    Actions extends AnyActionsConfig | undefined,
    Resources extends Record<string, ResourceConfig<any, any, any>> | undefined,
    Models extends Record<string, z.ZodTypeAny> | undefined
  >(config: {
    summary: string;
    internal?: boolean;
    actions?: Actions;
    namespacedResources?: Resources;
    models?: Models;
  }) => ResourceConfig<Actions, Resources, Models>;

  api<
    TopLevel extends ResourceConfig<AnyActionsConfig, undefined, any>,
    Resources extends Record<string, AnyResourceConfig> | undefined
  >(config: {
    openapi: {
      endpoint: false;
    };
    topLevel?: TopLevel;
    resources?: Resources;
  }): APIDescription<TopLevel, Resources>;
  api<
    TopLevel extends ResourceConfig<AnyActionsConfig, undefined, any>,
    Resources extends Record<string, AnyResourceConfig> | undefined
  >(config: {
    openapi?: {
      endpoint?: HttpEndpoint;
    };
    topLevel?: TopLevel;
    resources?: Resources;
  }): APIDescription<
    TopLevel & { actions: { getOpenapi: OpenAPIEndpoint } },
    Resources
  >;

  // reexported conveniences
  PaginationParams: typeof PaginationParams;
  response: typeof response;
  pageResponse: typeof pageResponse;
  /**
   * Creates an expand param from all expandable paths in the given zod schema
   */
  expandParam: typeof expandParam;
  /**
   * Creates an select param from all selectable paths in the given zod schema
   */
  selectParam: typeof selectParam;
  openapiSpec: typeof openapiSpec;

  StlError: typeof StlError;
  BadRequestError: typeof BadRequestError;
  UnauthorizedError: typeof UnauthorizedError;
  ForbiddenError: typeof ForbiddenError;
  NotFoundError: typeof NotFoundError;
};

const prependZodPath = (path: string) => (error: any) => {
  if (error instanceof z.ZodError) {
    for (const issue of error.issues) {
      issue.path.unshift(path);
    }
  }
  throw error;
};

export function makeStl<UserContext extends object, Plugins extends AnyPlugins>(
  opts: StainlessOpts<Plugins>
): Stl<UserContext, Plugins> {
  const plugins: Record<string, StainlessPlugin<UserContext, any>> = {};
  const stl = {
    initContext<EC extends AnyEndpoint>(
      c: PartialStlContext<UserContext, EC>
    ): PartialStlContext<UserContext, EC> {
      return c;
    },
    initParams(p: Params) {
      return p;
    },

    // this gets filled in later, we just declare the type here.
    plugins: {} as ExtractStatics<Plugins>,

    execute: async function execute<EC extends AnyEndpoint>(
      endpoint: EC,
      params: Params,
      context: PartialStlContext<UserContext, EC>
    ): Promise<ExtractExecuteResponse<EC>> {
      for (const plugin of Object.values(plugins)) {
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
    },

    StlError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,

    PaginationParams,
    response,
    pageResponse,

    expandParam,
    selectParam,

    openapiSpec,

    endpoint: <
      Path extends ZodObjectSchema | undefined,
      Query extends ZodObjectSchema | undefined,
      Body extends ZodObjectSchema | undefined,
      Response extends z.ZodTypeAny = z.ZodVoid
    >({
      config,
      path,
      query,
      body,
      response,
      ...rest
    }: {
      endpoint: HttpEndpoint;
      config?: EndpointConfig;
      path?: Path;
      query?: Query;
      body?: Body;
      response?: Response;
      handler: Handler<
        UserContext &
          StlContext<Endpoint<UserContext, Path, Query, Body, Response>>,
        Path,
        Query,
        Body,
        Response extends z.ZodTypeAny ? z.input<Response> : undefined
      >;
    }): Endpoint<UserContext, Path, Query, Body, Response> => {
      return {
        config: config as EndpointConfig,
        path: path as Path,
        query: query as Query,
        body: body as Body,
        response: (response || z.void()) as Response,
        ...rest,
      };
    },

    resource: <
      Actions extends AnyActionsConfig | undefined,
      Resources extends
        | Record<string, ResourceConfig<any, any, any>>
        | undefined,
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
    }): ResourceConfig<Actions, Resources, Models> => {
      return {
        ...config,
        actions: actions || {},
        namespacedResources: namespacedResources || {},
        models: models || {},
      } as ResourceConfig<Actions, Resources, Models>;
    },

    api: <
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
    }): APIDescription<TopLevel, Resources> => {
      const openapiEndpoint = openapi?.endpoint ?? "get /api/openapi";
      const topLevelActions = topLevel?.actions || {};
      const apiDescription = {
        openapi: {
          endpoint: openapiEndpoint,
          get spec() {
            // TODO memoize
            return stl.openapiSpec(apiDescription);
          },
        },
        topLevel: {
          ...topLevel,
          actions: topLevelActions,
        },
        resources: resources || {},
      } as APIDescription<TopLevel, Resources>;

      if (openapiEndpoint !== false) {
        (topLevelActions as any).getOpenapi = stl.endpoint({
          endpoint: openapiEndpoint,
          response: OpenAPIResponse,
          async handler() {
            return stl.openapiSpec(apiDescription) as any;
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

interface ProxyCallbackOptions {
  path: string[];
  args: unknown[];
}

type ProxyCallback = (opts: ProxyCallbackOptions) => unknown;

function createRecursiveProxy(callback: ProxyCallback, path: string[]) {
  const proxy: unknown = new Proxy(
    () => {
      // dummy no-op function since we don't have any
      // client-side target we want to remap to
    },
    {
      get(_obj, key) {
        if (typeof key !== "string") return undefined;

        // Recursively compose the full path until a function is invoked
        return createRecursiveProxy(callback, [...path, key]);
      },
      apply(_1, _2, args) {
        // Call the callback function with the entire path we
        // recursively created and forward the arguments
        return callback({
          path,
          args,
        });
      },
    }
  );

  return proxy;
}

type ValueOf<T extends object> = T[keyof T];

type ExtractClientPath<E extends AnyEndpoint> = E["path"] extends z.ZodTypeAny
  ? ValueOf<z.input<E["path"]>>
  : undefined;
type ExtractClientQuery<E extends AnyEndpoint> = E["query"] extends z.ZodTypeAny
  ? z.input<E["query"]>
  : undefined;
type ExtractClientBody<E extends AnyEndpoint> = E["body"] extends z.ZodTypeAny
  ? z.input<E["body"]>
  : undefined;

type CapitalLetter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

type ListAction = `list${`${CapitalLetter | "_"}${string}` | ""}`;

type ExtractClientResponse<
  Action,
  E extends AnyEndpoint
> = Action extends ListAction
  ? z.infer<E["response"]> extends PageData<any>
    ? PaginatorPromise<z.infer<E["response"]>>
    : ExtractClientResponse<unknown, E>
  : E["response"] extends z.ZodTypeAny
  ? ClientPromise<z.infer<E["response"]>>
  : ClientPromise<undefined>;

type StainlessClient<Api extends AnyAPIDescription> = ClientResource<
  ResourceConfig<
    Api["topLevel"]["actions"],
    Api["resources"],
    Api["topLevel"]["models"]
  >
>;

type ClientResource<Resource extends AnyResourceConfig> = {
  [Action in keyof Resource["actions"]]: Resource["actions"][Action] extends AnyEndpoint
    ? ClientFunction<Action, Resource["actions"][Action]>
    : never;
} & {
  [S in keyof Resource["namespacedResources"]]: ClientResource<
    Resource["namespacedResources"][S]
  >;
};

type ClientFunction<
  Action,
  E extends AnyEndpoint
> = E["path"] extends z.ZodTypeAny
  ? E["body"] extends z.ZodTypeAny
    ? (
        path: ExtractClientPath<E>,
        body: ExtractClientBody<E>,
        options?: { query?: ExtractClientQuery<E> }
      ) => ExtractClientResponse<Action, E>
    : E["query"] extends z.ZodTypeAny
    ? (
        path: ExtractClientPath<E>,
        query: ExtractClientQuery<E>
      ) => ExtractClientResponse<Action, E>
    : (path: ExtractClientPath<E>) => ExtractClientResponse<Action, E>
  : E["body"] extends z.ZodTypeAny
  ? (
      body: ExtractClientBody<E>,
      options?: { query?: ExtractClientQuery<E> }
    ) => ExtractClientResponse<Action, E>
  : E["query"] extends z.ZodTypeAny
  ? (query: ExtractClientQuery<E>) => ExtractClientResponse<Action, E>
  : () => ExtractClientResponse<Action, E>;

export type Headers = Record<string, string | null | undefined>;
export type KeysEnum<T> = { [P in keyof Required<T>]: true };

export type RequestOptions<Req extends {} = Record<string, unknown>> = {
  method?: HttpMethod;
  path?: string;
  query?: Req | undefined;
  body?: Req | undefined;
  headers?: Headers | undefined;

  maxRetries?: number;
  stream?: boolean | undefined;
  timeout?: number;
  idempotencyKey?: string;
};

// This is required so that we can determine if a given object matches the RequestOptions
// type at runtime. While this requires duplication, it is enforced by the TypeScript
// compiler such that any missing / extraneous keys will cause an error.
const requestOptionsKeys: KeysEnum<RequestOptions> = {
  method: true,
  path: true,
  query: true,
  body: true,
  headers: true,

  maxRetries: true,
  stream: true,
  timeout: true,
  idempotencyKey: true,
};

function isEmpty(obj: object): boolean {
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) return true;
  }
  return false;
}

export const isRequestOptions = (obj: unknown): obj is RequestOptions => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    !isEmpty(obj) &&
    Object.keys(obj).every((k) => Object.hasOwn(requestOptionsKeys, k))
  );
};

function actionMethod(action: string): HttpMethod {
  if (/^(get|list)([_A-Z]|$)/.test(action)) return "get";
  if (/^delete([_A-Z]|$)/.test(action)) return "delete";
  // TODO: is it possible to deal with patch/put?
  return "post";
}

export function createClient<Api extends AnyAPIDescription>(
  baseUrl: string
): StainlessClient<Api> {
  const client = createRecursiveProxy((opts) => {
    const callPath = [...opts.path]; // e.g. ["issuing", "cards", "create"]
    const action = callPath.pop()!; // TODO validate
    const { args } = opts;
    let requestOptions: RequestOptions<any> | undefined;

    let path = callPath.join("/"); // eg; /issuing/cards
    if (typeof args[0] === "string" || typeof args[0] === "number") {
      path += `/${encodeURIComponent(args.shift() as string | number)}`;
    }

    if (isRequestOptions(args.at(-1))) {
      requestOptions = args.shift() as any;
    }
    const method = actionMethod(action);

    const body = method === "get" ? undefined : args[0];

    const pathname = `${baseUrl}/${path}`;
    let uri = pathname;

    const query: Record<string, any> = {
      ...(method === "get" && typeof args[0] === "object" ? args[0] : null),
      ...requestOptions?.query,
    };
    let search = "";
    if (query && Object.keys(query).length) {
      search = `?${qs.stringify(query)}`;
      uri += search;
    }

    let cacheKey = uri;
    if (action === "list") {
      const { pageSize, sortDirection = "asc", ...restQuery } = query;
      cacheKey = `${pathname}?${qs.stringify({ ...restQuery, sortDirection })}`;
    }

    const doFetch = async () => {
      const json = await fetch(uri, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...requestOptions?.headers,
        },
        body: body ? JSON.stringify(body) : undefined, // TODO: don't include on GET
      }).then(async (res) => {
        const responsebody = await res.text();
        try {
          return JSON.parse(responsebody);
        } catch (e) {
          console.error("Could not parse json", responsebody);
        }
      });

      if ("error" in json) {
        throw new Error(`Error: ${json.error.message}`);
      }

      const parsed = AnyPageData.safeParse(json);
      if (parsed.success) {
        return new PageImpl(
          client,
          opts.path,
          pathname,
          query as any,
          parsed.data
        );
      }
      return json;
    };

    const promiseProps = {
      method,
      uri,
      pathname,
      search,
      query,
      cacheKey,
    };

    return action === "list"
      ? new PaginatorPromise(doFetch, promiseProps)
      : new ClientPromise(doFetch, promiseProps);
  }, []) as StainlessClient<Api>;
  return client;
}

export type Page<D extends PageData<any>> = PageImpl<D> & D;

export class PageImpl<D extends PageData<any>> {
  constructor(
    private client: StainlessClient<any>,
    private clientPath: string[],
    private pathname: string,
    private params: z.infer<typeof PaginationParams>,
    private data: D
  ) {
    Object.assign(this, data);
  }

  declare items: PageItemType<D>[];
  declare startCursor: string | null;
  declare endCursor: string | null;
  declare hasNextPage: boolean | undefined;
  declare hasPreviousPage: boolean | undefined;

  getPreviousPageParams(): z.infer<typeof PaginationParams> {
    const { startCursor } = this.data;
    if (startCursor == null) {
      throw new Error(
        `response doesn't have startCursor, can't get previous page`
      );
    }
    const {
      pageSize,
      sortBy,
      sortDirection,
      // eslint-disable-next-line no-unused-vars
      pageAfter: _pageAfter,
      // eslint-disable-next-line no-unused-vars
      pageBefore: _pageBefore,
      ...rest
    } = this.params;
    return {
      ...rest,
      pageSize,
      sortBy,
      sortDirection,
      pageBefore: startCursor,
    };
  }

  getPreviousPageParam(): string | null {
    return this.data.startCursor;
  }

  getPreviousPageUrl(): string {
    return `${this.pathname}/${qs.stringify(this.getPreviousPageParams())}`;
  }

  async getPreviousPage(): Promise<Page<D>> {
    return await this.clientPath
      .reduce((client: any, path) => client[path], this.client)
      .list(this.getPreviousPageParams());
  }

  getNextPageParams(): z.infer<typeof PaginationParams> {
    const { endCursor } = this.data;
    if (endCursor == null) {
      throw new Error(`response doesn't have endCursor, can't get next page`);
    }
    const {
      pageSize,
      sortBy,
      sortDirection,
      // eslint-disable-next-line no-unused-vars
      pageAfter: _pageAfter,
      // eslint-disable-next-line no-unused-vars
      pageBefore: _pageBefore,
      ...rest
    } = this.params;
    return {
      ...rest,
      pageSize,
      sortBy,
      sortDirection,
      pageAfter: endCursor,
    };
  }

  getNextPageParam(): string | null {
    return this.data.endCursor;
  }

  getNextPageUrl(): string {
    return `${this.pathname}/${qs.stringify(this.getNextPageParams())}`;
  }

  async getNextPage(): Promise<Page<D>> {
    return await this.clientPath
      .reduce((client: any, path) => client[path], this.client)
      .list(this.getNextPageParams());
  }
}

type ClientPromiseProps = {
  method: HttpMethod;
  uri: string;
  pathname: string;
  search: string;
  query: Record<string, any>;
  cacheKey: string;
};

class ClientPromise<R> implements Promise<R> {
  fetch: () => Promise<R>;
  method: HttpMethod;
  uri: string;
  pathname: string;
  search: string;
  query: Record<string, any>;
  cacheKey: string;

  constructor(fetch: () => Promise<R>, props: ClientPromiseProps) {
    this.fetch = once(fetch);
    this.method = props.method;
    this.uri = props.uri;
    this.pathname = props.pathname;
    this.search = props.search;
    this.query = props.query;
    this.cacheKey = props.cacheKey;
  }

  then<TResult1 = R, TResult2 = never>(
    onfulfilled?:
      | ((value: R) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    return this.fetch().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<R | TResult> {
    return this.fetch().catch(onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null): Promise<R> {
    return this.fetch().finally(onfinally);
  }

  get [Symbol.toStringTag]() {
    return "ClientPromise";
  }
}

export type { ClientPromise };

/**
 * The result of client.???.list, can be awaited like a
 * Promise to get a single page, or async iterated to go through
 * all items
 */
class PaginatorPromise<D extends PageData<any>>
  extends ClientPromise<Page<D>>
  implements AsyncIterable<PageItemType<D>>
{
  constructor(fetch: () => Promise<Page<D>>, props: ClientPromiseProps) {
    super(fetch, props);
  }

  async *[Symbol.asyncIterator](): AsyncIterator<PageItemType<D>> {
    let page: Page<D> | undefined = await this;
    while (page) {
      yield* page.items;
      page = page.hasNextPage ? await page.getNextPage() : undefined;
    }
  }

  get [Symbol.toStringTag]() {
    return "PaginatorPromise";
  }
}

export type { PaginatorPromise };
