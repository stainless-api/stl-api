# Inclusion

Inclusion allows you to optionally include associated objects in an API response if the
user requests them in an `include` query parameter. Here's an example of a
`GET /api/posts/{postId}` endpoint with an includable `user` property:

```
$ curl localhost:3000/api/posts/5
{"id":5,"body":"Officia similique ipsa"}

$ curl localhost:3000/api/posts/5 -G -d 'include[]=user'
{"id":5,"body":"Officia similique ipsa","user":{"id":7,"name":"Kim Bahringer"}}
```

## Implementing inclusion without circular associations

You can add support for an includable field by marking it
`.includable()` in the response schema and adding
`include: z.includes(...)` to your query schema.

> **Warning**
>
> Currently, the `z.includes(...)` parameter must be named
> `include` and declared in the `query`.

> **Note**
>
> Although `.includable()` can be called on any schema, it only works
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
    user: User.includable(),
  })
  .prismaModel(prisma.post);

export const retrieve = stl.endpoint({
  endpoint: "GET /api/posts/{post}",
  response: Post,
  path: z.path({
    post: z.string().prismaModelLoader(prisma.post),
  }),
  query: z.query({
    include: z.includes(Post).optional(),
  }),
  async handler({ post }, ctx) {
    return post;
  },
});
```

`z.includes(Post)` automatically generates possible values
for the `include` query parameter from the response properties
that are marked `.includable()` (including any nested includable
properties).

## Automatic Prisma integration

The `@stl-api/prisma` plugin will automatically generate the necessary
`include` for prisma queries via [`ctx.prisma`](/packages/prisma/README.md#perform-crud-operations-on-response-prismamodel) or [`prismaModelLoader()`](/packages/prisma/README.md#use-prismamodelloader-on-a-parameter) when
you have [declared a `.prismaModel(...)`](/packages/prisma/README.md#declare-prismamodel-on-a-response-type) on the response schema.

For other use cases, you will need to write code in your handler to
add fields to the response that were requested to be included.

## Implementing inclusion with circular associations

When the associations are circular, it becomes necessary to declare
types for the schemas due to TypeScript limitations. Stainless provides
a `z.CircularModel` helper type to make this more manageable.

For example suppose the `User` also has an includable list of `Post`s
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
  posts: z.array(z.lazy(() => Post)).includable(),
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
  user: z.lazy(() => User).includable(),
});

// .prismaModel() must be called separately so that the z.ZodType annotation
// doesn't erase its type information
const Post = ExpandablePost.prismaModel(prisma.post);

export const retrieve = stl.endpoint({
  endpoint: "GET /api/posts/{post}",
  response: Post,
  path: z.path({
    post: z.string().prismaModelLoader(prisma.post),
  }),
  query: z.query({
    include: z.includes(Post, 3).optional(),
  }),
  async handler({ post }, ctx) {
    return post;
  },
});
```

Now we've passed a second argument to `z.includes()`, which is the recursion depth limit (3 is the default).
This means that the following include paths are allowed:

- `user`
- `user.posts`
- `user.posts.user`
- `user.posts.user.posts`

Obviously for many use cases, you would want to keep the depth limit low.

> **Warning**
> The maximum recursion depth supported by `z.includes` is 5.
