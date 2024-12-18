import { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { StatusCode } from "hono/utils/http-status";
import qs from "qs";
import {
  allEndpoints,
  AnyAPIDescription,
  AnyEndpoint,
  isStlError,
  NotFoundError,
} from "stainless";
import { isValidRouteMatch, makeRouteMatcher } from "./routeMatcher";

export type HonoServerContext = {
  type: "hono";
  args: [Context];
};

declare module "stainless" {
  interface StlContext<EC extends AnyBaseEndpoint> {
    server: HonoServerContext;
  }
}

export type StlAppOptions = {
  handleErrors?: boolean;
};

const methods = ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];

function makeHandler(endpoints: AnyEndpoint[], options?: StlAppOptions) {
  const stl = endpoints[0]?.stl;
  if (!stl) {
    throw new Error(`endpoints[0].stl must be defined`);
  }

  const routeMatcher = makeRouteMatcher(endpoints);

  return createMiddleware(async (c, next) => {
    try {
      const match = routeMatcher.match(c.req.method, c.req.path);
      const { search } = new URL(c.req.url);

      if (!isValidRouteMatch(match)) {
        const enabledMethods = methods.filter((method) =>
          isValidRouteMatch(routeMatcher.match(method, c.req.path))
        );
        if (enabledMethods.length) {
          return c.json(
            {
              message: `No handler for ${c.req.method}; only ${enabledMethods
                .map((x) => x.toUpperCase())
                .join(", ")}.`,
            },
            { status: 405 }
          );
        }
        if (options?.handleErrors !== false) {
          throw new NotFoundError();
        }
        await next();
        return;
      }

      const [endpoint, path] = match[0][0];
      const server: HonoServerContext = {
        type: "hono",
        args: [c],
      };

      const context = stl.initContext({
        endpoint,
        headers: c.req.header(),
        server,
      });

      const params = stl.initParams({
        path,
        query: search ? qs.parse(search.replace(/^\?/, "")) : {},
        body: await c.req.json().catch(() => undefined),
        headers: c.req.header(),
      });

      const result = await stl.execute(params, context);

      if (result instanceof Response) {
        return result;
      }

      return c.json(result);
    } catch (error) {
      if (options?.handleErrors === false) {
        throw error;
      }

      if (isStlError(error)) {
        return c.json(error.response, error.statusCode as StatusCode);
      }

      console.error(
        `ERROR in ${c.req.method} ${c.req.url}:`,
        error instanceof Error ? error.stack : error
      );
      return c.json({ error, details: "Failed to handle the request." }, 500);
    }
  });
}

export function stlApi(
  { topLevel, resources }: AnyAPIDescription,
  options?: StlAppOptions
) {
  return makeHandler(
    allEndpoints({
      actions: topLevel?.actions,
      namespacedResources: resources,
    }),
    options
  );
}
