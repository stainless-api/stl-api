# @stl-api/next: Next.js plugin for Stainless API

Use this plugin to serve a Stainless API in a Next.js app.

# Getting started

> **Warning**
>
> This is alpha software, and we may make significant changes in the coming months.
> We're eager for you to try it out and let us know what you think!

## Installation

```
npm i --save stainless-api/stl-api#next-0.0.2
```

## Add plugin to stainless instance

```diff
// ~/libs/stl.ts

import { Stl } from "stainless";
+import { makeNextPlugin } from "@stl-api/next";

const plugins = {
+  next: makeNextPlugin(),
};

export const stl = new Stl({
  plugins,
});
```

## Serve API with catchall app route

```ts
// ~/app/api/[...catchall]/route.ts

import { api } from "~/api/api";
import { stlNextAppCatchAllRouter } from "@stl-api/next";

const { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS } =
  stlNextAppCatchAllRouter(api, {
    catchAllParam: "catchall",
  });

export { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS };
```

## Serve API with catchall pages route

```ts
// ~/pages/api/[...catchall].ts
import { api } from "~/api/api";
import { stlNextPageCatchAllRouter } from "@stl-api/next";

export default stlNextPageCatchAllRouter(api, {
  catchAllParam: "splat",
});
```

## Incremental adoption with app router

```ts
// ~/app/api/posts/route.ts

import { stlNextAppRoute } from "@stl-api/next";
import { create } from "~/api/posts/create";
import { list } from "~/api/posts/list";

export const GET = stlNextAppRoute(list);
export const POST = stlNextAppRoute(create);
```

## Incremental adoption with pages router

```ts
// ~/pages/api/posts/index.ts

import { posts } from "~/api/posts";
import { stlNextPageRoute } from "@stl-api/next";

export default stlNextPageRoute(posts.actions.list, posts.actions.create);
```

## Changing the base URL of the API

If you have endpoints under `/api` like:

```ts
export const list = stl.endpoint({
  endpoint: "GET /api/posts",
```

And you want to serve them under `/api/v2` instead, you can
pass `basePathMap: { "/api/": "/api/v2/" }` in the second argument
of `stlNextPageRoute`, `stlNextPageCatchAllRouter`, `stlNextAppRoute`, or `stlNextAppCatchAllRouter`:

```ts
// ~/app/api/v2/[...catchall]/route.ts

import { api } from "~/api/api";
import { stlNextAppCatchAllRouter } from "@stl-api/next";

const { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS } =
  stlNextAppCatchAllRouter(api, {
    catchAllParam: "splat",
    basePathMap: { "/api/": "/api/v2/" },
  });

export { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS };
```
