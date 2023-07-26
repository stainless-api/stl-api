# @stl-api/express: Express integration for Stainless API

Use this package to serve a Stainless API in an [Express](https://expressjs.com/) app.

# Table of Contents

- [@stl-api/express: Express integration for Stainless API](#stl-apiexpress-express-integration-for-stainless-api)
- [Table of Contents](#table-of-contents)
- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Create an Express Application from a Stainless API](#create-an-express-application-from-a-stainless-api)
    - [Options](#options)
    - [Notes](#notes)
  - [Create an Express Router from a Stainless API](#create-an-express-router-from-a-stainless-api)
    - [Options](#options-1)
    - [Notes](#notes-1)
  - [Create an Express Router from a Stainless API Resource](#create-an-express-router-from-a-stainless-api-resource)
    - [Options](#options-2)
    - [Notes](#notes-2)
  - [Register Stainless API Endpoints on an Express Application or Router](#register-stainless-api-endpoints-on-an-express-application-or-router)
    - [Options](#options-3)
    - [Notes](#notes-3)
  - [Register Stainless Resource Endpoints on an Express Application or Router](#register-stainless-resource-endpoints-on-an-express-application-or-router)
    - [Options](#options-4)
    - [Notes](#notes-4)
  - [Register a single Stainless API Endpoint on an Express Application or Router](#register-a-single-stainless-api-endpoint-on-an-express-application-or-router)
    - [Options](#options-5)
    - [Notes](#notes-5)
  - [Create an Express request handler function for a single Stainless API Endpoint](#create-an-express-request-handler-function-for-a-single-stainless-api-endpoint)
    - [Options](#options-6)
    - [Notes](#notes-6)
  - [Execute a Stainless API Endpoint for an Express request](#execute-a-stainless-api-endpoint-for-an-express-request)
- [`AddEndpointsToExpressOptions`](#addendpointstoexpressoptions)
  - [`basePathMap?: Record<string, string>`](#basepathmap-recordstring-string)
  - [`handleErrors?: boolean` (default: `true`)](#handleerrors-boolean-default-true)
  - [`addMethodNotAllowedHandlers?: boolean` (default: `true`)](#addmethodnotallowedhandlers-boolean-default-true)
- [`AddToExpressOptions`](#addtoexpressoptions)
  - [`basePathMap?: Record<string, string>`](#basepathmap-recordstring-string-1)
  - [`handleErrors?: boolean` (default: `true`)](#handleerrors-boolean-default-true-1)

# Getting started

> **Warning**
>
> This is alpha software, and we may make significant changes in the coming months.
> We're eager for you to try it out and let us know what you think!

## Installation

```
npm i --save stainless-api/stl-api#express-0.0.2
```

## Create an Express Application from a Stainless API

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

### Options

See [`AddEndpointsToExpressOptions`](#addendpointstoexpressoptions).

### Notes

`stlExpressAPI` is provided as a convenience; for production use
cases you'll probably want to use more fine-grained methods below
that enable greater customization.

`stlExpressAPI` installs default json, text and raw middleware on the app:

```ts
app.use(express.json());
app.use(express.text());
app.use(express.raw());
```

## Create an Express Router from a Stainless API

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

### Options

See [`AddEndpointsToExpressOptions`](#addendpointstoexpressoptions).

### Notes

`stlExpressAPIRouter` is provided as a convenience; for production use
cases you'll probably want to use more fine-grained methods below
that enable greater customization.

`stlExpressAPIRouter` installs default json, text and raw middleware on the router:

```ts
router.use(express.json());
router.use(express.text());
router.use(express.raw());
```

## Create an Express Router from a Stainless API Resource

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

### Options

See [`AddEndpointsToExpressOptions`](#addendpointstoexpressoptions).

### Notes

`stlExpressResourceRouter` is provided as a convenience; for production use
cases you'll probably want to use more fine-grained methods below
that enable greater customization.

`stlExpressResourceRouter` installs default json, text and raw middleware on the router:

```ts
router.use(express.json());
router.use(express.text());
router.use(express.raw());
```

## Register Stainless API Endpoints on an Express Application or Router

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

### Options

See [`AddEndpointsToExpressOptions`](#addendpointstoexpressoptions).

### Notes

By default `addStlAPIToExpress` will handle all errors on API routes.
If you want to customize error handling you may want to pass the
`handleErrors: false` and/or `addMethodNotAllowedHandlers: false`
options.

## Register Stainless Resource Endpoints on an Express Application or Router

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

### Options

See [`AddEndpointsToExpressOptions`](#addendpointstoexpressoptions).

### Notes

By default `addStlResourceToExpress` will handle all errors on API routes.
If you want to customize error handling you may want to pass the
`handleErrors: false` and/or `addMethodNotAllowedHandlers: false`
options.

## Register a single Stainless API Endpoint on an Express Application or Router

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

### Options

See [`AddToExpressOptions`](#addtoexpressoptions).

### Notes

By default `addStlEndpointToExpress` will handle all errors on the route.
If you want to customize error handling you may want to pass the
`handleErrors: false` option.

## Create an Express request handler function for a single Stainless API Endpoint

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

### Options

See [`AddToExpressOptions`](#addtoexpressoptions).

### Notes

By default `stlExpressRouteHandler` will handle all errors on the route.
If you want to customize error handling you may want to pass the
`handleErrors: false` option.

## Execute a Stainless API Endpoint for an Express request

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

# `AddEndpointsToExpressOptions`

## `basePathMap?: Record<string, string>`

Mappings to apply to Stainless API Endpoint paths. For example
with `basePathMap: { '/api/', '/api/v2/' }, the endpoint
`GET /api/posts`would GET transformed to `GET /api/v2/posts`

## `handleErrors?: boolean` (default: `true`)

If `false`, errors will be passed to the `next` middleware;
otherwise the created express handler will send the appropriate
response if an error is caught.

## `addMethodNotAllowedHandlers?: boolean` (default: `true`)

Whether to add 405 method not allowed handlers to the Express
`Router` or `Application`

# `AddToExpressOptions`

## `basePathMap?: Record<string, string>`

Mappings to apply to Stainless API Endpoint paths. For example
with `basePathMap: { '/api/', '/api/v2/' }, the endpoint
`GET /api/posts`would get transformed to `GET /api/v2/posts`

## `handleErrors?: boolean` (default: `true`)

If `false`, errors will be passed to the `next` middleware;
otherwise the created express handler will send the appropriate
response if an error is caught.
