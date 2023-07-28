---
sidebar_position: 0
---

# Getting started

:::caution

This is alpha software, and we may make significant changes in the coming months.
We're eager for you to try it out and let us know what you think!

:::

Use this plugin to serve a Stainless API in a Next.js app.

## Installation

```
npm i --save 'stainless-api/stl-api#express-0.0.2'
```

## Creating Express Applications and Routers

### Stainless API -> Express Application

```ts
stlExpressAPI(
  api: AnyAPIDescription,
  options?: AddEndpointsToExpressOptions
): Application
```

```ts
import { stlExpressAPI } from "@stl-api/express";
import api from "./api";

export const app = stlExpressAPI(api);
```

#### Options

See [`AddEndpointsToExpressOptions`](#addendpointstoexpressoptions).

#### Notes

`stlExpressAPI` is provided as a convenience; for production use
cases you'll probably want to use more fine-grained methods below
that enable greater customization.

`stlExpressAPI` installs default json, text and raw middleware on the app:

```ts
app.use(express.json());
app.use(express.text());
app.use(express.raw());
```

### Stainless API -> Express Router

```ts
stlExpressAPIRouter(
  api: AnyAPIDescription,
  options?: AddEndpointsToExpressOptions
): Router
```

```ts
import { stlExpressAPIRouter } from "@stl-api/express";
import api from "./api";

export const router = stlExpressAPIRouter(api);
```

#### Options

See [`AddEndpointsToExpressOptions`](#addendpointstoexpressoptions).

#### Notes

`stlExpressAPIRouter` is provided as a convenience; for production use
cases you'll probably want to use more fine-grained methods below
that enable greater customization.

`stlExpressAPIRouter` installs default json, text and raw middleware on the router:

```ts
router.use(express.json());
router.use(express.text());
router.use(express.raw());
```

### Stainless Resource -> Express Router

```ts
stlExpressResourceRouter(
  resource: Pick<AnyResourceConfig, "actions" | "namespacedResources">,
  options?: AddEndpointsToExpressOptions & RouterOptions
): Router
```

```ts
import { stlExpressResourceRouter } from "@stl-api/express";
import posts from "./posts";

export const router = stlExpressResourceRouter(posts);
```

#### Options

See [`AddEndpointsToExpressOptions`](#addendpointstoexpressoptions).

#### Notes

`stlExpressResourceRouter` is provided as a convenience; for production use
cases you'll probably want to use more fine-grained methods below
that enable greater customization.

`stlExpressResourceRouter` installs default json, text and raw middleware on the router:

```ts
router.use(express.json());
router.use(express.text());
router.use(express.raw());
```

## Registering Stainless API Endpoints with Express

### Register an entire Stainless API

```ts
addStlAPIToExpress(
  router: Application | Router,
  api: AnyAPIDescription,
  options?: AddEndpointsToExpressOptions
): void
```

```ts
import express from "express";
import { addStlAPIToExpress } from "@stl-api/express";
import api from "./api";

export const app = express();
// you'll need to specify body parser middleware, e.g.:
app.use(express.json());
app.use(express.text());
app.use(express.raw());

addStlAPIToExpress(app, api);
```

#### Options

See [`AddEndpointsToExpressOptions`](#addendpointstoexpressoptions).

#### Notes

By default `addStlAPIToExpress` will handle all errors on API routes.
If you want to customize error handling you may want to pass the
`handleErrors: false` and/or `addMethodNotAllowedHandlers: false`
options.

### Register a Stainless Resource

```ts
addStlResourceToExpress(
  router: Application | Router,
  resource: Pick<AnyResourceConfig, "actions" | "namespacedResources">,
  options?: AddEndpointsToExpressOptions
): void
```

```ts
import express from "express";
import { addStlResourceToExpress } from "@stl-api/express";
import posts from "./posts";

export const app = express();
// you'll need to specify body parser middleware, e.g.:
app.use(express.json());
app.use(express.text());
app.use(express.raw());

addStlResourceToExpress(app, posts);
```

#### Options

See [`AddEndpointsToExpressOptions`](#addendpointstoexpressoptions).

#### Notes

By default `addStlResourceToExpress` will handle all errors on API routes.
If you want to customize error handling you may want to pass the
`handleErrors: false` and/or `addMethodNotAllowedHandlers: false`
options.

### Register a single Stainless API Endpoint

```ts
addStlEndpointToExpress(
  router: Application | Router,
  endpoint: AnyEndpoint,
  options?: AddToExpressOptions
): void
```

```ts
import express from "express";
import { addStlEndpointToExpress } from "@stl-api/express";
import retrievePosts from "./posts/retrieve";

export const app = express();
// you'll need to specify body parser middleware, e.g.:
app.use(express.json());
app.use(express.text());
app.use(express.raw());

addStlEndpointToExpress(app, retrievePosts);
```

#### Options

See [`AddToExpressOptions`](#addtoexpressoptions).

#### Notes

By default `addStlEndpointToExpress` will handle all errors on the route.
If you want to customize error handling you may want to pass the
`handleErrors: false` option.

## Lower-level APIs

### Create an Express request handler

```ts
stlExpressRouteHandler(
  endpoint: AnyEndpoint,
  options: CreateExpressHandlerOptions
): RequestHandler
```

```ts
import express from "express";
import { stlExpressRouteHandler } from "@stl-api/express";
import retrievePosts from "./posts/retrieve";

export const app = express();

app.get(
  "/api/posts/:postId",
  express.json(),
  stlExpressRouteHandler(retrievePosts)
);
```

#### Options

See [`AddToExpressOptions`](#addtoexpressoptions).

#### Notes

By default `stlExpressRouteHandler` will handle all errors on the route.
If you want to customize error handling you may want to pass the
`handleErrors: false` option.

### Call a Stainless API endpoint from an Express handler

```ts
stlExecuteExpressRequest<EC extends AnyEndpoint>(
  endpoint: AnyEndpoint,
  req: Request,
  res: Response
): Promise<EndpointResponseOutput<EC>>
```

```ts
import express, { Request, Response } from "express";
import { stlExecuteExpressRequest } from "@stl-api/express";
import retrievePosts from "./posts/retrieve";

export const app = express();

app.get("/api/posts/:postId", express.json(), (req: Request, res: Response) => {
  const response = await stlExecuteExpressRequest(retrievePosts, req, res);
  res.status(200).json(response);
});
```

### Parse request from an Express handler

```ts
stlPrepareExpressRequest<EC extends AnyEndpoint>(
  endpoint: AnyEndpoint,
  req: Request,
  res: Response
): Promise<[RequestData<EC["path"], EC["query"], EC["body"]>, StlContext<EC>]>
```

```ts
import express, { Request, Response } from "express";
import { stlPrepareExpressRequest } from "@stl-api/express";
import retrievePosts from "./posts/retrieve";
import prisma from "../libs/prismadb";

export const app = express();

app.get("/api/posts/:postId", express.json(), (req: Request, res: Response) => {
  const [{ postId }, stlContext] = await stlPrepareExpressRequest(
    retrievePosts,
    req,
    res
  );
  const post = await prisma.posts.findUniqueOrThrow({ where: { id: postId } });
  const repsonse = await retrievePosts.response.parseAsync(responseInput, {
    stlContext,
  });
  res.status(200).json(response);
});
```

## Type Reference

### `AddEndpointsToExpressOptions`

#### `basePathMap?: Record<string, string>`

Mappings to apply to Stainless API Endpoint paths. For example
with `basePathMap: { '/api/', '/api/v2/' }, the endpoint
`GET /api/posts`would GET transformed to `GET /api/v2/posts`

#### `handleErrors?: boolean` (default: `true`)

If `false`, errors will be passed to the `next` middleware;
otherwise the created express handler will send the appropriate
response if an error is caught.

#### `addMethodNotAllowedHandlers?: boolean` (default: `true`)

Whether to add 405 method not allowed handlers to the Express
`Router` or `Application`

### `AddToExpressOptions`

#### `basePathMap?: Record<string, string>`

Mappings to apply to Stainless API Endpoint paths. For example
with `basePathMap: { '/api/', '/api/v2/' }, the endpoint
`GET /api/posts`would get transformed to `GET /api/v2/posts`

#### `handleErrors?: boolean` (default: `true`)

If `false`, errors will be passed to the `next` middleware;
otherwise the created express handler will send the appropriate
response if an error is caught.
