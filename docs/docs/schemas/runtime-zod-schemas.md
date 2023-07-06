---
sidebar_position: 2
---

# Runtime Zod schema definition

We provide a customized version of [Zod](https://zod.dev/) for declaring request and response schemas,
available via the following import:

```ts
import { z } from "stainless";
```

:::caution

Make sure to use the above import instead of importing directly `from "zod"`.

:::

In addition to all of the usual Zod schema types, we provide the following specialty types and methods:

## Zod Extensions

### `.prismaModel(model)`

:::info
this is only available if using the [`@stl-api/prisma`](/stl/prisma/getting-started) plugin.
:::
:::caution

Make sure `@stl-api/prisma` gets imported before code that declares schemas is run.

:::

Allows you to declare the Prisma model associated with a response schema. In an endpoint whose
response schema has a Prisma model declared, [special conveniences](/stl/prisma/getting-started#perform-crud-operations-on-response-prismamodel) will be available.

### `.includable()`

Marks an object property as being [includable](/stl/inclusion) via an `include` query parameter.
This is only useful object or array of object types.

### `.selectable()`

Marks an object property as being [selectable](/stl/selection) via a `select` query parameter.
This is only useful object or array of object types.

### `.selection()`

Use this to declare the schema for a `.selectable()` field value:

```ts
user_fields: z.lazy(() => User.selection()).selectable();
```

:::caution

Currently, using `.partial()` instead of `.selection()` will cause nested
`.selectable()` properties to malfunction.

:::

### `z.path(shape)`

Declares the schema for path parameters. This currently just does `z.object(shape)`,
but it may have more specialized behavior in the future.

### `z.query(shape)`

Declares the schema for query (search) parameters. This currently just does `z.object(shape)`,
but it may have more specialized behavior in the future.

### `z.body(shape)`

Declares the schema for request body parameters. This currently just does `z.object(shape)`,
but it may have more specialized behavior in the future.

### `z.response(shape)`

Declares a response object schema. This currently just does `z.object(shape)`,
but it may have more specialized behavior in the future.

### `z.PaginationParams`

A Zod schema for the base [request query parameters](#request-query-parameters). You may call `z.PaginationParams.extend({...})` to override defaults or add parameters to it.

### `z.pageResponse(item)`

Creates a Zod schema for a page response with the given `item` type
schema.

### `z.PageData<I>`

The output type of `z.pageResponse(item: I)`.

### `z.PageItemType<D extends z.PageData<any>>`

Extracts the item type from the page data type `D`.

### `z.AnyPageData`

A Zod schema for a page response whose items are any type.

### `z.SortDirection`

A Zod schema for `sortDirection` (`"asc" | "desc"`).

### `z.CircularModel<Base, CircularProps>`

A helper for declaring response schemas with circular references.

#### Example

[See here](/stl/inclusion#implementing-inclusion-with-circular-associations) for a
more complete example.

```ts
const UserBase = z.response({
  id: z.string().uuid(),
  name: z.string().optional(),
});

const IncludableUser: z.CircularModel<
  typeof UserBase,
  {
    posts?: z.IncludableZodType<z.ZodArray<Post>>;
  }
> = UserBase.extend({
  posts: z.array(z.lazy(() => Post)).includable(),
});

const PostBase = z.response({
  id: z.string().uuid(),
  body: z.string(),
});

const IncludablePost: z.CircularModel<
  typeof PostBase,
  {
    user?: z.IncludableZodType<User>;
  }
> = PostBase.extend({
  user: z.lazy(() => User).includable(),
});
```