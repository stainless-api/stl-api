# Pagination with `@stl-api/prisma`

> **Warning**
>
> At the moment, `@stl-api/prisma` doesn't support multi-column
> sort order in pagination.

## Easiest method: `ctx.prisma.paginate(options)`

If your endpoint `response` declares a `.prismaModel()`, you will
be able to call `ctx.prisma.paginate()`, and it will make the
necessary `findMany` for the pagination params from the query and
and additional options you provide:

```ts
// ~/api/posts/list.ts

import z from "zod";
import prisma from "~/libs/prismadb";
import { stl } from "~/libs/stl";
import { Post } from "./models";

// This assumes Post has a .prismaModel(prisma.post)
// declaration attached to it; stl.pageResponse inherits
// the .prismaModel.
const response = stl.pageResponse(Post);

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

> **Warning**
>
> Currently `ctx.prisma.paginate` doesn't custom names for `PaginationParams`
> or `response` fields.

## Lower level: `ctx.prisma.findMany(options)`

`ctx.prisma.findMany` also injects Prisma options from pagination
params, but unlike `paginate`, it resolves to the array of items
directly from Prisma.

We plan to make `z.pageResponse()` schemas accept an array of items
as input soon, but currently you must pass the items to
[`stl.plugins.prisma.pagination.makeResponse()`](#stlpluginsprismapaginationmakeresponsepaginationparams-items)
or build the response manually.

> **Note**
>
> `ctx.prisma.findMany` will inject `limit: pageSize + 1` so that
> it's possible to > determine `hasPreviousPage` or `hasNextPage` by
> the presence or absence of an extra item in the query results.
> If the extra item is present it should not be included in the
> response, and will be removed by `makeResponse`.

## Lower level: `stl.plugins.prisma.paginate(prismaModel, options)`

Performs `prismaModel.findMany()` with the given `options` (which
includes both standard Prisma `findMany` options and pagination
parameters) and resolves to a [z.PageData](/packages/stainless/docs/pagination.md#zpagedatai) response.

## Lowest-level methods

You can use the following lowest-level methods if the above methods
don't suit your needs for some reason, for instance if you want
to use different parameter or response field names.

`@stl-api/prisma` adds the following methods to your `stl` instance:

### `stl.plugins.prisma.pagination.wrapQuery(paginationParams, query)`

Combines the given prisma `query` (`findMany` options) with values
from the given `paginationParams`, and returns the combined `findMany` options.

> **Note**
>
> `wrapQuery` will inject `limit: pageSize + 1` so that it's
> possible to > determine `hasPreviousPage` or `hasNextPage` by
> the presence or absence of an extra item in the query results.
> If the extra item is present it should not be included in the
> response, and will be removed by `makeResponse`.

### `stl.plugins.prisma.pagination.makeResponse(paginationParams, items)`

Creates a [`z.PageData`](/packages/stainless/docs/pagination.md#zpagedatai) response from the given items.

> **Note**
>
> `makeResponse` will determine `hasPreviousPage` or `hasNextPage`
> based upon whether `items.length` > `params.pageSize`.
> It will remove any `items` beyond `params.pageSize`.
