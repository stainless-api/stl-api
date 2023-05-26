# @stl-api/next: Next.js plugin for Stainless API

Use this plugin to serve a Stainless API in a Next.js app.

# Getting started

## Installation

```
npm i --save stainless-api/stl-api#next-0.0.1
```

## Add plugin to stainless instance

```diff
// ~/libs/stl.ts

import { makeStl } from "stainless";
+import { makeNextPlugin } from "@stl-api/next";

export type StlUserContext = {};

const plugins = {
+  next: makeNextPlugin(),
};

export const stl = makeStl<StlUserContext, typeof plugins>({
  plugins,
});
```

## Serve API with catchall app route

```ts
// ~/app/api/[...catchall]/route.ts

import { api } from "~/api/api";
import { stl } from "~/libs/stl";

const { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS } =
  stl.plugins.next.appCatchAllRouter(api, {
    catchAllParam: "catchall",
  });

export { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS };
```

## Serve API with catchall pages route

```ts
// ~/pages/api/[...catchall].ts
import { api } from "~/api/api";
import { stl } from "~/libs/stl";

export default stl.plugins.next.catchAllRouter(api, {
  catchAllParam: "splat",
});
```

## Incremental adoption with app router

```ts
// ~/app/api/posts/route.ts

import { stl } from "~/libs/stl";
import { create } from "~/api/posts/create";
import { list } from "~/api/posts/list";

export const GET = stl.plugins.next.appRoute(list);
export const POST = stl.plugins.next.appRoute(create);
```

## Incremental adoption with pages router

```ts
// ~/pages/api/posts/index.ts

import { posts } from "~/api/posts";
import { stl } from "~/libs/stl";

export default stl.plugins.next.pageRoute(
  posts.actions.list,
  posts.actions.create
);
```

## Changing the base URL of the API

If you have endpoints under `/api` like:

```ts
export const list = stl.endpoint({
  endpoint: "get /api/posts",
```

And you want to serve them under `/api/v2` instead, you can
pass `basePathMap: { "/api/": "/api/v2/" }` in the second argument
of `pageRoute`, `catchAllRouter`, `appRoute`, or `appCatchAllRouter`:

```ts
// ~/app/api/v2/[...catchall]/route.ts

import { api } from "~/api/api";
import { stl } from "~/libs/stl";

const { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS } =
  stl.plugins.next.appCatchAllRouter(api, {
    catchAllParam: "splat",
    basePathMap: { "/api/": "/api/v2/" },
  });

export { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS };
```
