---
sidebar_position: 7
---

# Expansion

Expansion allows you to optionally include associated objects in an API response if the
user requests them in an `expand` query parameter. Here's an example of a
`get /api/posts/{postId}` endpoint with an expandable `user` property:

```
$ curl localhost:3000/api/posts/5
{"id":5,"body":"Officia similique ipsa"}

$ curl localhost:3000/api/posts/5 -G -d 'expand[]=user' -d 'expand[]=replies'
{"id":5,"body":"Officia similique ipsa","user":{"id":7,"name":"Kim Bahringer"},
"replies":[{"id":11},{"id":19}]}
```

## Implementing expansion without circular associations

You can add support for an expandable field by marking it
`.expandable()` in the response schema and adding
`expand: z.expands(...)` to your query schema.

:::caution

Currently, the `z.expands(...)` parameter must be named
`expand` and declared in the `query`.

:::

:::info

Although `.expandable()` can be called on any schema, it only works
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
    user: User.expandable(),
  })
  .prismaModel(prisma.post);

export const retrieve = stl.endpoint({
  endpoint: "get /api/posts/{post}",
  response: Post,
  path: z.path({
    post: z.string().prismaModelLoader(prisma.post),
  }),
  query: z.query({
    expand: z.expands(Post).optional(),
  }),
  async handler({ post }, ctx) {
    return post;
  },
});
```

`z.expands(Post)` automatically generates possible values
for the `expand` query parameter from the response properties
that are marked `.expandable()` (including any nested expandable
properties).

## Automatic Prisma integration

The `@stl-api/prisma` plugin will automatically generate the necessary
`include` for prisma queries via [`ctx.prisma`](/stl/prisma/getting-started#perform-crud-operations-on-response-prismamodel) or [`prismaModelLoader()`](/stl/prisma/getting-started#use-prismamodelloader-on-a-parameter) when
you have [declared a `.prismaModel(...)`](/stl/prisma/getting-started#declare-prismamodel-on-a-response-type) on the response schema.

For other use cases, you will need to manually include the expanded paths in
your response.

## Implementing expansion with circular associations

When the associations are circular, it becomes necessary to declare
types for the schemas due to TypeScript limitations. Stainless provides
a `z.CircularModel` helper type to make this more manageable.

For example suppose the `User` also has an expandable list of `Post`s
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

const ExpandableUser: z.CircularModel<
  typeof UserBase,
  {
    posts?: z.ExpandableZodType<z.ZodArray<Post>>;
  }
> = UserBase.extend({
  posts: z.array(z.lazy(() => Post)).expandable(),
});

// .prismaModel() must be called separately so that the z.ZodType annotation
// doesn't erase its type information
const User = ExpandableUser.prismaModel(prisma.user);

const PostBase = z.response({
  id: z.string().uuid(),
  body: z.string(),
});

const ExpandablePost: z.CircularModel<
  typeof PostBase,
  {
    user?: z.ExpandableZodType<User>;
  }
> = PostBase.extend({
  user: z.lazy(() => User).expandable(),
});

// .prismaModel() must be called separately so that the z.ZodType annotation
// doesn't erase its type information
const Post = ExpandablePost.prismaModel(prisma.post);

export const retrieve = stl.endpoint({
  endpoint: "get /api/posts/{post}",
  response: Post,
  path: z.path({
    post: z.string().prismaModelLoader(prisma.post),
  }),
  query: z.query({
    expand: z.expands(Post, 3).optional(),
  }),
  async handler({ post }, ctx) {
    return post;
  },
});
```

Now we've passed a second argument to `z.expands()`, which is the recursion depth limit (3 is the default).
This means that the following expand paths are allowed:

- `user`
- `user.posts`
- `user.posts.user`
- `user.posts.user.posts`

Obviously for many use cases, you would want to keep the depth limit low.

:::caution
The maximum recursion depth supported by `z.expands` is 5.

:::
