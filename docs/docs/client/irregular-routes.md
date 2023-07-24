---
sidebar_position: 1
---

# Irregular routes

By default, a client method like `client.posts.retrieve(...)` will make a `GET /posts` request.
If the HTTP method or path needs to be different, the route is "irregular".

To support irregular routes you'll need to run a small build step to generate a _route map_
(which is just a `.ts` file declaring HTTP methods and paths for irregular routes) and use
the route map in your client.

## Generating route maps

To generate a route map, run the `gen-stl-api-route-map` command (provided by the `stainless`
package) on the file that declares an `stl.api`:

```
$ gen-stl-api-route-map api/api.ts
wrote api/api-route-map.ts
```

:::info
Soon the schema codegen CLI will find API declarations and generate
route maps for them automatically.
:::

## Using the route map in your client

Import the route map and pass it as the `routeMap` option to `createClient`:

```diff
import { createClient } from "stainless";
import type { api } from "./api";
+import { api as routeMap } from "./api-route-map";

export const client = createClient<typeof api>(
  "/api",
+  { routeMap }
);
```
