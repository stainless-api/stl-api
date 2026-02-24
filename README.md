# @stl-api/express: Express integration for Stainless API

Use this package to serve a Stainless API in an [Express](https://expressjs.com/) app.

# Table of Contents

- [@stl-api/express: Express integration for Stainless API](#stl-apiexpress-express-integration-for-stainless-api)
- [Table of Contents](#table-of-contents)
- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Creating an Express Router](#creating-an-express-router)
    - [From an entire Stainless API](#from-an-entire-stainless-api)
      - [Options](#options)
      - [Notes](#notes)
    - [From a Stainless Resource](#from-a-stainless-resource)
      - [Options](#options-1)
      - [Notes](#notes-1)
  - [Lower-level APIs](#lower-level-apis)
    - [Create an Express request handler](#create-an-express-request-handler)
      - [Options](#options-2)
      - [Notes](#notes-2)
    - [Call a Stainless API endpoint from an Express handler](#call-a-stainless-api-endpoint-from-an-express-handler)
    - [Parse request from an Express handler](#parse-request-from-an-express-handler)
  - [Type Reference](#type-reference)
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
npm i --save 'stainless-api/stl-api#express-0.0.3'
```

## Creating an Express Router

### From an entire Stainless API

```ts
apiRouter(
  api: AnyAPIDescription,
  options?: AddEndpointsToExpressOptions
): Router
```

```ts
import { apiRouter } from "@stl-api/express";
import express from "express";
import api from "./api";

const app = express();
app.use(apiRouter(api));
```

#### Options

See [`AddEndpointsToExpressOptions`](#addendpointstoexpressoptions).

#### Notes

`apiRouter` is provided as a convenience; for production use
cases you'll probably want to use more fine-grained methods below
that enable greater customization.

`apiRouter` installs default json, text and raw middleware on the router:

```ts
router.use(express.json());
router.use(express.text());
router.use(express.raw());
```

### From a Stainless Resource

```ts
resourceRouter(
  resource: Pick<AnyResourceConfig, "actions" | "namespacedResources">,
  options?: AddEndpointsToExpressOptions & RouterOptions
): Router
```

```ts
import { resourceRouter } from "@stl-api/express";
import express from "express";
import posts from "./posts";

const app = express();
app.use(resourceRouter(posts));
```

#### Options

See [`AddEndpointsToExpressOptions`](#addendpointstoexpressoptions).

#### Notes

`resourceRouter` is provided as a convenience; for production use
cases you'll probably want to use more fine-grained methods below
that enable greater customization.

`resourceRouter` installs default json, text and raw middleware on the router:

```ts
router.use(express.json());
router.use(express.text());
router.use(express.raw());
```

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
