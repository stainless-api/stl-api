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

import { makeStl } from "@stl-api/stl";
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

export const Post = z.response(
  z.object({
    id: z.string().uuid(),
    body: z.string().nullable().optional(),
    userId: z.string().uuid(),
  }),
+  { prismaModel: prisma.post }
);
```

## Use `prismaModelLoader` on a parameter

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
    return post;
  },
});
```

## Pagination

```ts
// ~/api/posts/list.ts

import z from "zod";
import prisma from "~/libs/prismadb";
import { stl } from "~/libs/stl";
import { Post } from "./models";

const response = stl.pageResponse(Post, {
  prismaModel: prisma.post,
});

export const list = stl.endpoint({
  endpoint: "get /api/posts",
  query: stl.PaginationParams.extend({
    sortBy: z.enum(["id"]).default("id"),
    userId: z.string().optional(),
    pageSize: z.coerce.number().default(20),
  }),
  response,
  async handler({ userId }, ctx) {
    return await ctx.prisma.paginate({
      where: userId ? { userId } : {},
    });
  },
});
```
