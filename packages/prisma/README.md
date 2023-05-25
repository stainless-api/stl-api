# @stl-api/prisma: Prisma plugin for Stainless API

Provides highly productive ways of creating APIs with Prisma and Stainless.

# Getting started

## Installation

```
npm i --save @stl-api/prisma
```

## Add plugin to stainless instance

```diff
// ~/libs/stl.ts

import { makeStl } from "stainless";
+import { makePrismaPlugin } from "@stl-api/prisma";

export type StlUserContext = {};

const plugins = {
+  prisma: makePrismaPlugin(),
};

export const stl = makeStl<StlUserContext, typeof plugins>({
  plugins,
});
```

## Declare `prismaModel` on a response type

```diff
// ~/api/posts/models.ts

import z from "zod";
+import prisma from "~/libs/prisma";

export const Post = z.response({
  id: z.string().uuid(),
  body: z.string().nullable().optional(),
  userId: z.string().uuid(),
}).prismaModel(prisma.post);
```

## Perform CRUD operations on response `prismaModel`

Any endpoint whose `response` has a `prismaModel` declared with have `ctx.prisma`
available in its `handler`. `ctx.prisma` provides wrappers for the following methods
that magically inject options for [`expand`](/packages/stainless/docs/expansion.md)
and [`select`](/packages/stainless/docs/selection.md) params as necessary:

- `findUnique`
- `findUniqueOrThrow`
- `findMany` (also magically injects pagination options from parameters)
- `create`
- `update`
- `delete`

> **Warning**
>
> This currently only works if the primary key is named `id`.
> We plan to remove this limitation soon.

```ts
// ~/api/posts/retrieve.ts

import { stl } from "~/libs/stl";
import z from "zod";
import prisma from "~/libs/prismadb";
import { Post } from "./models";

export const retrieve = stl.endpoint({
  endpoint: "get /api/posts/{postId}",
  path: z.object({
    postId: z.string(),
  }),
  query: z.object({
    expand: z.expands(Post, 3).optional(),
    select: z.selects(Post, 3).optional(),
  }),
  response: Post,
  async handler({ postId }, ctx) {
    // Prisma plugin magically injects options for expand and select!
    return await ctx.prisma.findUniqueOrThrow({ where: { id: postId } });
  },
});
```

```ts
// ~/api/posts/create.ts

import { stl } from "~/libs/stl";
import z from "zod";
import { Post } from "./models";

export const create = stl.endpoint({
  endpoint: "post /api/posts",
  body: z.object({
    body: z.string(),
  }),
  response: Post,
  async handler({ body }, ctx) {
    return await ctx.prisma.create({
      data: {
        userId: ctx.requireCurrentUser().id,
        body,
      },
    });
  },
});
```

## Use `prismaModelLoader` on a parameter

The following `post: z.string().prismaModelLoader(prisma.post)`
parameter takes a string `id` as input from the `{post}` path
parameter and is transformed to the fetched model instance in
the `handler`.

> **Warning**
>
> This currently only works if the primary key is named `id`.
> We plan to remove this limitation soon.

```ts
// ~/api/posts/retrieve.ts

import { stl } from "@/libs/stl";
import z from "zod";
import prisma from "@/libs/prismadb";
import { Post } from "./models";

export const retrieve = stl.endpoint({
  endpoint: "get /api/posts/{post}",
  path: z.object({
    post: z.string().prismaModelLoader(prisma.post),
  }),
  response: Post,
  async handler({ post }, ctx) {
    // here post is fetched Prisma model, not a string
    return post;
  },
});
```

# In-depth topics

## [Pagination](/packages/prisma/docs/pagination.md)

`@stl-api/prisma` makes it easy to implement pagination with Prisma.
