import {
  AnyAPIDescription,
  AnyEndpoint,
  MakeStainlessPlugin,
  NotFoundError,
  StlError,
  allEndpoints,
} from "stainless";
import qs from "qs";
import { NextApiRequest, NextApiResponse } from "next";
import { TrieRouter } from "hono/router/trie-router";
import { endpointToHono } from "./endpointToHono";
import { NextRequest, NextResponse } from "next/server";

declare module "stainless" {
  interface StlContext<EC extends AnyEndpoint> {
    server: NextServerContext;
  }
}

export type NextServerContext = {
  type: "nextjs";
  args:
    | [NextApiRequest, NextApiResponse]
    | [NextRequest, { params: Record<string, any> }];
};

type RouterOptions = {
  catchAllParam?: string;
  basePathMap?: Record<string, string>;
};

type NextStatics = {
  pageRoute: <Endpoints extends AnyEndpoint[]>(
    ...endpoint: Endpoints
  ) => PagesHandler;

  catchAllRouter: <API extends AnyAPIDescription>(
    api: API,
    /**
     * If options.catchAllParam is given, it will be excluded from params
     * passed to handlers
     */
    options?: RouterOptions
  ) => PagesHandler;

  appRoute: (endpoint: AnyEndpoint, options?: RouterOptions) => AppHandler;

  appCatchAllRouter: <API extends AnyAPIDescription>(
    api: API,
    /**
     * If options.catchAllParam is given, it will be excluded from params
     * passed to handlers
     */
    options?: RouterOptions
  ) => AppHandlers;
};

const methods = ["get", "head", "post", "put", "delete", "patch", "options"];

type PagesHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;

type AppHandler = (
  req: NextRequest,
  ctx: { params: Record<string, any> }
) => Promise<NextResponse>;

type AppHandlers = {
  GET: AppHandler;
  HEAD: AppHandler;
  POST: AppHandler;
  PUT: AppHandler;
  DELETE: AppHandler;
  PATCH: AppHandler;
  OPTIONS: AppHandler;
};

const makeAppHandlers = (handler: AppHandler): AppHandlers => ({
  GET: handler,
  HEAD: handler,
  POST: handler,
  PUT: handler,
  DELETE: handler,
  PATCH: handler,
  OPTIONS: handler,
});

// Next plugin, TODO move to its own file
export const makeNextPlugin =
  (): MakeStainlessPlugin<any, NextStatics> => (stl) => {
    function makeRouter(
      endpoints: AnyEndpoint[],
      options?: RouterOptions
    ): { appHandler: AppHandler; pagesHandler: PagesHandler } {
      const routeMatcher: TrieRouter<AnyEndpoint> = new TrieRouter();
      for (const endpoint of endpoints) {
        let [method, path] = endpointToHono(endpoint.endpoint);

        const basePathMap = options?.basePathMap;
        if (basePathMap) {
          // rewrite paths based on config…
          // TODO this is maybe not a feature we should keep.
          // (we just wanted it to serve routes from 2 places (Next and Hono) for testing purposes)
          for (const k in basePathMap) {
            if (path.startsWith(k)) {
              path = path.replace(k, basePathMap[k]);
              break;
            }
          }
        }
        routeMatcher.add(method, path, endpoint);
      }
      const catchAllParam = options?.catchAllParam;

      const appHandler = async (
        req: NextRequest,
        ctx: { params: Record<string, any> }
      ): Promise<NextResponse> => {
        try {
          const { method, url } = req;

          const { pathname, search } = new URL(url);
          const match = routeMatcher.match(method.toLowerCase(), pathname);

          if (!match) {
            const enabledMethods = methods.filter(
              (method) => routeMatcher.match(method, pathname) != null
            );
            if (enabledMethods.length) {
              return NextResponse.json(
                {
                  message: `No handler for ${req.method}; only ${enabledMethods
                    .map((x) => x.toUpperCase())
                    .join(", ")}.`,
                },
                { status: 405 }
              );
            }
            throw new NotFoundError();
          }

          const {
            handlers: [endpoint],
            params: path,
          } = match;

          const server: NextServerContext = {
            type: "nextjs",
            args: [req, ctx],
          };
          const headers: Record<string, string> = {};
          req.headers.forEach((value, key) => (headers[key] = value));
          const context = stl.initContext({
            endpoint,
            // url: new URL(req.url!), // TODO make safe
            headers,
            server,
          });

          let query = search ? qs.parse(search.replace(/^\?/, "")) : {};
          if (catchAllParam) {
            // eslint-disable-next-line no-unused-vars
            let catchAll;
            ({ [catchAllParam]: catchAll, ...query } = query);
          }

          const bodyText = await req.text();

          const params = stl.initParams({
            path,
            query,
            body: bodyText ? JSON.parse(bodyText) : undefined,
            headers: req.headers,
          });

          const result = await stl.execute(endpoint, params, context);
          return NextResponse.json(result);
        } catch (error) {
          if (error instanceof StlError) {
            return NextResponse.json(error.response, {
              status: error.statusCode,
            });
          }

          console.error(
            `ERROR in ${req.method} ${req.url}:`,
            error instanceof Error ? error.stack : error
          );
          return NextResponse.json(
            { error, details: "Failed to handle the request." },
            { status: 500 }
          );
        }
      };

      const pagesHandler = async (
        req: NextApiRequest,
        res: NextApiResponse
      ) => {
        const resp = null as any as NextResponse;
        try {
          const { method, url } = req;
          if (!method) throw new Error(`missing req.method`);
          if (!url) throw new Error(`missing req.url`);
          if (!url.startsWith("/"))
            throw new Error(`expected url to start with /, but got ${url}`);

          const { pathname } = new URL(`http://localhost${url}`);
          const match = routeMatcher.match(method.toLowerCase(), pathname);

          if (!match) {
            const enabledMethods = methods.filter(
              (method) => routeMatcher.match(method, pathname) != null
            );
            if (enabledMethods.length) {
              res.status(405).json({
                message: `No handler for ${req.method}; only ${enabledMethods
                  .map((x) => x.toUpperCase())
                  .join(", ")}.`,
              });
              return;
            }
            throw new NotFoundError();
          }

          const {
            handlers: [endpoint],
            params: path,
          } = match;

          const server: NextServerContext = {
            type: "nextjs",
            args: [req, res],
          };
          const context = stl.initContext({
            endpoint,
            // url: new URL(req.url!), // TODO make safe
            headers: req.headers,
            server,
          });

          let query = req.query;
          if (catchAllParam) {
            // eslint-disable-next-line no-unused-vars
            let catchAll;
            ({ [catchAllParam]: catchAll, ...query } = req.query);
          }

          const params = stl.initParams({
            path,
            query: qs.parse(query as any),
            body: req.body,
            headers: req.headers,
          });

          const result = await stl.execute(endpoint, params, context);
          res.status(200).send(result);
        } catch (error) {
          if (error instanceof StlError) {
            res.status(error.statusCode).json(error.response);
            return;
          }

          console.error(
            `ERROR in ${req.method} ${req.url}:`,
            error instanceof Error ? error.stack : error
          );
          res
            .status(500)
            .json({ error, details: "Failed to handle the request." });
          return;
        }
      };
      return { appHandler, pagesHandler };
    }

    const pageRoute = <Endpoints extends AnyEndpoint[]>(
      ...endpoints: Endpoints
    ) => makeRouter(endpoints).pagesHandler;

    const catchAllRouter = <API extends AnyAPIDescription>(
      { topLevel, resources }: API,
      options?: RouterOptions
    ) =>
      makeRouter(
        allEndpoints({
          actions: topLevel?.actions,
          namespacedResources: resources,
        }),
        options
      ).pagesHandler;

    const appRoute = (endpoint: AnyEndpoint, options?: RouterOptions) =>
      makeRouter([endpoint], options).appHandler;

    const appCatchAllRouter = <API extends AnyAPIDescription>(
      { topLevel, resources }: API,
      options?: RouterOptions
    ) =>
      makeAppHandlers(
        makeRouter(
          allEndpoints({
            actions: topLevel?.actions,
            namespacedResources: resources,
          }),
          options
        ).appHandler
      );

    return {
      statics: {
        pageRoute,
        catchAllRouter,
        appRoute,
        appCatchAllRouter,
      },
    };
  };