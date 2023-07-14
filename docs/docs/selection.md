---
sidebar_position: 8
---

# Selection

Selection allows you to pick what subset of fields on an associated object are returned
in an API response, if the user requests them in a `select` query parameter. Here's an example of a
`get /api/posts/{postId}` endpoint with an selectable `user_fields` property:

```
$ curl localhost:3000/api/posts/5
{"id":5,"body":"Officia similique ipsa"}

$ curl localhost:3000/api/posts/5 -G -d 'select=user_fields.name'
{"id":5,"body":"Officia similique ipsa","user_fields":{"name":"Kim Bahringer"}}
```

## Pristine convention

The [pristine convention](/stl/intro#pristine) is to have a selectable property as a sibling of an
[includable](/stl/inclusion) property. So in the above example
there would be an includable `user` property, whose type has some properties
always defined, and a selectable `user_fields` property, whose type has all properties
optional.

This allows for SDKs of all languages to provide better types for includable fields than
if `select` could omit properties of the includable fields.

### Select format

`select` supports subproperties via both dot and brace notation, for example:

```
-d 'select=items.user_fields{id,comments_fields{id,body}},items.comments_fields.body'
```

:::info

It's not possible to generate precise types for `select` because the number
of possibilities can easily become huge. We may decide to use a different
format for `select` in the future to achieve better type safety (for example,
the same format as `include`).

:::

## Implementing select without circular associations

You can add support for a selectable field by marking it
`.selectable()` in the response schema and adding
`select: z.selects(...)` to your query schema:

:::caution

Currently, the `z.selects(...)` parameter must be named
`select` and declared in the `query`.

:::

:::info

Although `.selectable()` can be called on any schema, it only works
with schemas of type object or array of objects.

:::

```ts
// api/posts/index.ts
import { z } from "stainless";
import { stl } from "~/libs/stl";
import prisma from "~/libs/prismadb";

const User = z
  .response({
    id: z.string().uuid(),
    name: z.string().optional(),
  })
  .prismaModel(prisma.user);

const Post = z
  .response({
    id: z.string().uuid(),
    body: z.string(),
    user_fields: User.selectable(),
  })
  .prismaModel(prisma.post);

export const retrieve = stl.endpoint({
  endpoint: "get /api/posts/{post}",
  response: Post,
  path: z.path({
    post: z.string().prismaModelLoader(prisma.post),
  }),
  query: z.query({
    select: z.selects(Post).optional(),
  }),
  async handler({ post }, ctx) {
    return post;
  },
});
```

`z.selects(Post)` creates a schema that automatically validates
the `select` query parameter from the response properties
that are marked `.selectable()` (including any nested selectable
properties).

## Automatic Prisma integration

The `@stl-api/prisma` plugin will automatically generate the necessary
`include` for prisma queries via [`ctx.prisma`](/stl/prisma/getting-started#perform-crud-operations-on-response-prismamodel) or [`prismaModelLoader()`](/stl/prisma/getting-started#use-prismamodelloader-on-a-parameter) when
you have [declared a `.prismaModel(...)`](/stl/prisma/getting-started#declare-prismamodel-on-a-response-type) on the response schema.

For other use cases, you will need to write code in your handler to
add fields to the response that requested to be selected.

## Implementing selection with circular associations

When the associations are circular, it becomes necessary to declare
types for the schemas due to TypeScript limitations. Stainless provides
a `z.CircularModel` helper type to make this more manageable.

For example suppose the `User` also has an selectable list of `Post`s
(in a real-world API you would want to use a paginated list endpoint
to fetch `Post`s, but for the sake of demonstration):

```ts
import { z } from "stainless";
import { stl } from "~/libs/stl";
import prisma from "~/libs/prismadb";

const UserBase = z.response({
  id: z.string().uuid(),
  name: z.string().optional(),
});

const SelectableUser: z.CircularModel<
  typeof UserBase,
  {
    posts_fields?: z.SelectableZodType<z.ZodArray<Post>>;
  }
> = UserBase.extend({
  posts_fields: z.array(z.lazy(() => Post)).selectable(),
});

// .prismaModel() must be called separately so that the z.ZodType annotation
// doesn't erase its type information
const User = SelectableUser.prismaModel(prisma.user);

const PostBase = z.response({
  id: z.string().uuid(),
  body: z.string(),
});

const SelectablePost: z.CircularModel<
  typeof PostBase,
  {
    user_fields?: z.SelectableZodType<User>;
  }
> = PostBase.extend({
  user_fields: z.lazy(() => User).selectable(),
});

// .prismaModel() must be called separately so that the z.ZodType annotation
// doesn't erase its type information
const Post = SelectablePost.prismaModel(prisma.post);

export const retrieve = stl.endpoint({
  endpoint: "get /api/posts/{post}",
  response: Post,
  path: z.path({
    post: z.string().prismaModelLoader(prisma.post),
  }),
  query: z.query({
    select: z.selects(Post, 3).optional(),
  }),
  async handler({ post }, ctx) {
    return post;
  },
});
```

Now we've passed a second argument to `z.selects()`, which is the recursion depth limit (3 is the default).
This means that the following select paths are allowed:

- `user_fields`
- `user_fields.posts_fields`
- `user_fields.posts_fields.user_fields`
- `user_fields.posts_fields.user_fields.posts_fields`

Obviously for many use cases, you would want to keep the depth limit low.

:::caution
The maximum recursion depth supported by `z.includes` is 5.

:::
