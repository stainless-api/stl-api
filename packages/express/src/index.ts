import express, {
  Router as makeRouter,
  type Request,
  type Application,
  type Router,
  type Response,
  type RequestHandler,
  type NextFunction,
  type ErrorRequestHandler,
  RouterOptions,
} from "express";
import {
  AnyAPIDescription,
  AnyActionsConfig,
  EndpointResponseOutput,
  StlContext,
  RequestData,
  EndpointResponseInput,
  isStlError,
} from "stainless";
import { parseEndpoint, type AnyEndpoint } from "stainless";

export type ExpressServerContext = {
  type: "express";
  args: [Request, Response];
};

export type CreateExpressHandlerOptions = {
  /**
   * If false, errors will be passed to the `next` middleware;
   * otherwise the created express handler will send the appropriate
   * response if an error is caught.
   */
  handleErrors?: boolean;
};

type BasePathMap = Record<string, string>;

export type AddToExpressOptions = CreateExpressHandlerOptions & {
  /**
   * Mappings to apply to Stainless API Endpoint paths.  For example
   * with `basePathMap: { '/api/', '/api/v2/' }, the endpoint
   * `GET /api/posts` would get transformed to `GET /api/v2/posts`
   */
  basePathMap?: BasePathMap;
};

/**
 * Runs Stainless middleware and gets the parsed params
 * for a given Stainless API Endpoint and Express Request/Response.
 *
 * @param endpoint the endpoint to execute the request on
 * @param req the Express request
 * @param res the Express response
 * @returns a Promise that resolves to the parsed params
 */
export async function parseParams<EC extends AnyEndpoint>(
  endpoint: EC,
  req: Request,
  res: Response
): Promise<RequestData<EC["path"], EC["query"], EC["body"]>> {
  return (await parseParamsWithContext(endpoint, req, res))[0];
}

/**
 * Runs Stainless middleware and gets the parsed params and context
 * for a given Stainless API Endpoint and Express Request/Response.
 *
 * @param endpoint the endpoint to execute the request on
 * @param req the Express request
 * @param res the Express response
 * @returns a Promise that resolves to [params, context]
 */
export async function parseParamsWithContext<EC extends AnyEndpoint>(
  endpoint: EC,
  req: Request,
  res: Response
): Promise<[RequestData<EC["path"], EC["query"], EC["body"]>, StlContext<EC>]> {
  const { params: path, headers, body, query } = req;

  const { stl } = endpoint;

  const server: ExpressServerContext = {
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

  return await stl.parseParamsWithContext(params, context);
}

/**
 * Creates a response for the given Stainless endpoint.
 * @param endpoint An endpoint with a response schema
 * @param response The response data
 * @returns A promise that resolves to the schema-parsed response body,
 * or rejects if `response` fails validation
 */
export async function makeResponse<EC extends AnyEndpoint>(
  endpoint: EC,
  response: EndpointResponseInput<EC>
): Promise<EndpointResponseOutput<EC>> {
  if (!endpoint.response) {
    throw new Error("endpoint has no response schema");
  }
  return await endpoint.response.parseAsync(response);
}

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
export async function executeRequest<EC extends AnyEndpoint>(
  endpoint: AnyEndpoint,
  req: Request,
  res: Response
): Promise<EndpointResponseOutput<EC>> {
  const { params: path, headers, body, query } = req;

  const { stl } = endpoint;

  const server: ExpressServerContext = {
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

  return await stl.execute(params, context);
}

/**
 * Creates an express route handler function for the given stainless endpoint.
 */
function expressHandler(
  endpoint: AnyEndpoint,
  options: CreateExpressHandlerOptions
): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await executeRequest(endpoint, req, res);
      res.status(200).json(result);
      return;
    } catch (error) {
      if (options?.handleErrors === false) {
        next(error);
        return;
      }

      errorHandler(error, req, res, next);
      return;
    }
  };
}

const methodNotAllowedHandler: RequestHandler = (
  req: Request,
  res: Response
) => {
  res.status(405).send();
};

/**
 * The default Express error handler middleware for errors thrown from
 * Stainless endpoints
 */
const errorHandler: ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response
) => {
  if (isStlError(error)) {
    res.status(error.statusCode).json(error.response);
    return;
  }
  console.error(
    `ERROR in ${req.method} ${req.url}:`,
    error instanceof Error ? error.stack : error
  );
  res.status(500).json({ error, details: "Failed to handle the request." });
};

function applyBasePathMap(
  path: string,
  basePathMap: BasePathMap | undefined
): string {
  if (basePathMap) {
    for (const k in basePathMap) {
      if (path.startsWith(k)) {
        return path.replace(k, basePathMap[k]);
      }
    }
  }
  return path;
}

function convertExpressPath(
  path: string,
  basePathMap: BasePathMap | undefined
): string {
  return applyBasePathMap(path, basePathMap)
    .split("/")
    .map((el) => el.replace(/^\{(.+)\}$/, ":$1"))
    .join("/");
}

/**
 * Registers a Stainless endpoint with the given Express Application or Router.
 */
export function addEndpointRoute(
  router: Application | Router,
  endpoint: AnyEndpoint,
  options?: AddToExpressOptions
) {
  const [method, path] = parseEndpoint(endpoint.endpoint);
  const expressPath = convertExpressPath(path, options?.basePathMap);

  const loweredMethod = method.toLowerCase() as
    | "get"
    | "post"
    | "put"
    | "patch"
    | "delete"
    | "options"
    | "head";

  router[loweredMethod](
    expressPath,
    // @ts-expect-error this is valid
    expressHandler(endpoint, options)
  );
}

type AnyResourceConfig = {
  actions: AnyActionsConfig | undefined;
  namespacedResources: Record<string, AnyResourceConfig> | undefined;
};

function addMethodNotAllowedHandlers(
  router: Application | Router,
  resource: Pick<AnyResourceConfig, "actions" | "namespacedResources">,
  options?: AddToExpressOptions,
  visited: Set<string> = new Set()
) {
  const { actions, namespacedResources } = resource;
  if (actions) {
    for (const action of Object.keys(actions)) {
      const endpoint = actions[action];
      if (!endpoint) continue;
      const [, path] = parseEndpoint(endpoint.endpoint);
      if (visited.has(path)) continue;
      visited.add(path);
      router.all(
        convertExpressPath(path, options?.basePathMap),
        // @ts-expect-error
        methodNotAllowedHandler
      );
    }
  }
  if (namespacedResources) {
    for (const name of Object.keys(namespacedResources)) {
      addMethodNotAllowedHandlers(
        router,
        namespacedResources[name],
        options,
        visited
      );
    }
  }
}

type AddEndpointsToExpressOptions = AddToExpressOptions & {
  /**
   * Whether to add 405 method not allowed handlers to the Express
   * Router or Application (defaults to true)
   */
  addMethodNotAllowedHandlers?: boolean;
};

/**
 * Registers all endpoints in a Stainless resource with the given Express Application or Router.
 */
function addResourceRoutes(
  router: Application | Router,
  resource: Pick<AnyResourceConfig, "actions" | "namespacedResources">,
  options?: AddEndpointsToExpressOptions
) {
  const { actions, namespacedResources } = resource;
  if (actions) {
    for (const action of Object.keys(actions)) {
      const endpoint = actions[action];
      if (!endpoint) continue;
      addEndpointRoute(router, endpoint, options);
    }
  }
  if (options?.addMethodNotAllowedHandlers !== false) {
    if (namespacedResources) {
      for (const name of Object.keys(namespacedResources)) {
        addResourceRoutes(router, namespacedResources[name], options);
      }
    }
    addMethodNotAllowedHandlers(router, resource, options);
  }
}

/**
 * Creates an Express Router for the given Stainless resource
 */
export function resourceRouter(
  resource: Pick<AnyResourceConfig, "actions" | "namespacedResources">,
  options?: AddEndpointsToExpressOptions & RouterOptions
): Router {
  const router = makeRouter(options);
  router.use(express.json());
  router.use(express.text());
  router.use(express.raw());
  addResourceRoutes(router, resource, options);
  return router;
}

/**
 * Registers all endpoints in a Stainless API with the given Express Application or Router.
 */
function addAPIRoutes(
  router: Application | Router,
  api: AnyAPIDescription,
  options?: AddEndpointsToExpressOptions
) {
  const { topLevel, resources } = api;
  addResourceRoutes(
    router,
    {
      actions: topLevel.actions,
      namespacedResources: resources,
    },
    options
  );
}

/**
 * Creates an Express Router for the given Stainless API
 */
export function apiRouter(
  api: AnyAPIDescription,
  options?: AddEndpointsToExpressOptions
): Router {
  const router = makeRouter();
  router.use(express.json());
  router.use(express.text());
  router.use(express.raw());
  addAPIRoutes(router, api, options);
  return router;
}
