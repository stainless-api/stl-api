# Expansion

Expansion allows you to optionally include associated objects in an API response if the
user requests them in an `expand` query parameter. Here's an example of a
`get /api/posts/{postId}` endpoint with an expandable `user` property:

```
$ curl localhost:3000/api/posts/018a286a-f44d-47c3-b8a4-af92096ff512
{"id":"018a286a-f44d-47c3-b8a4-af92096ff512","body":"Officia similique ipsa quaerat id suscipit"}

$ curl localhost:3000/api/posts/018a286a-f44d-47c3-b8a4-af92096ff512 -G -d 'expand[]=user'
{"id":"018a286a-f44d-47c3-b8a4-af92096ff512","body":"Officia similique ipsa quaerat id suscipit","user":{"id":"80250f1e-8fcd-4bcc-b676-28c080706e92","name":"Kim Bahringer"}}
```

## Implementing expansion without recursive associations

You can add support for an expandable field by marking it
`.expandable()` in the response schema and adding
`expand: z.expands(...)` to your query schema.

> **Warning**
>
> Currently, the `z.expands(...)` parameter must be named
> `expand` and declared in the `query`.

> **Note**
>
> Although `.expandable()` can be called on any schema, it only works
> with schemas of type object or array of objects.

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
`include` for prisma queries via [`ctx.prisma`](/packages/prisma/README.md#perform-crud-operations-on-response-prismamodel) or [`prismaModelLoader()`](/packages/prisma/README.md#use-prismamodelloader-on-a-parameter) when
you have [declared a `.prismaModel(...)`](/packages/prisma/README.md#declare-prismamodel-on-a-response-type) on the response schema.

For other use cases, you will need to manually include the expanded paths in
your response.

## Implementing expansion with recursive associations

When the associations are recursive, it becomes necessary to declare
input and output types for the schemas due to TypeScript limitations.
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

type UserOutput = z.output<typeof UserBase> & {
  posts?: z.ExpandableOutput<PostOutput[]>;
};
type UserInput = z.input<typeof UserBase> & {
  posts?: z.ExpandableInput<PostInput[]>;
};

const ExpandableUser: z.ZodType<UserOutput, z.ZodObjectDef, UserInput> =
  UserBase.extend({
    posts: z.array(z.lazy(() => Post)).expandable(),
  });

// .prismaModel() must be called separately so that the z.ZodType annotation
// doesn't erase its type information
const User = ExpandableUser.prismaModel(prisma.user);

const PostBase = z.response({
  id: z.string().uuid(),
  body: z.string(),
});

type PostOutput = z.output<typeof PostBase> & {
  user?: z.ExpandableOutput<UserOutput>;
};
type PostInput = z.input<typeof PostBase> & {
  user?: z.ExpandableInput<UserInput>;
};

const ExpandablePost: z.ZodType<PostOutput, z.ZodObjectDef, PostInput> =
  PostBase.extend({
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

> **Warning**
> The maximum recursion depth supported by `z.expands` is 5.
