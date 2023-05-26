---
sidebar_position: 4
---

# Endpoints

A Stainless API endpoint declares a method and URL, request and response parameter schemas, and
a handler function that handles the request. Here's a basic example:

```ts
// ~/api/users/retrieve.ts

import { stl } from "~/libs/stl";
import { z } from "stainless";
import prisma from "~/libs/prismadb";
import { User } from "./models";

export const retrieve = stl.endpoint({
  endpoint: "get /api/users/{userId}",
  response: User,
  path: z.object({
    userId: z.string(),
  }),
  async handler({ userId }, ctx) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new stl.NotFoundError();
    return user;
  },
});
```

## Properties

### `endpoint`

A string declaring the HTTP method (`get`, `post`, `put`, `patch`, `delete`, `options`, `head`) and
URL for this endpoint.

### `response`

The [schema](/docs/schemas) for the HTTP response.

### `path`

The [schema](/docs/schemas) for the path parameters.

### `query`

The [schema](/docs/schemas) for the query (search) parameters.

### `body`

The [schema](/docs/schemas) for the request body parameters.

### `handler(params, context)`

The function that handles requests to this `endpoint`. It will be called with a `params` object consisting
of the parsed `path`, `query`, and `body` parameters squashed together, a `context` object, and should return
or resolve to a raw response to be parsed by the `response` schema.

The `params`, `context` and return types will be automatically mapped from the request and response schemas.
