# Selection

Selection allows you to pick what subset of fields on an associated object are returned
in an API response, if the user requests them in a `select` query parameter. Here's an example of a
`get /api/posts/{postId}` endpoint with an selectable `user_fields` property:

```
$ curl localhost:3000/api/posts/018a286a-f44d-47c3-b8a4-af92096ff512
{"id":"018a286a-f44d-47c3-b8a4-af92096ff512","body":"Officia similique ipsa quaerat id suscipit"}

$ curl localhost:3000/api/posts/018a286a-f44d-47c3-b8a4-af92096ff512 -G -d 'select=user_fields.name'
{"id":"018a286a-f44d-47c3-b8a4-af92096ff512","body":"Officia similique ipsa quaerat id suscipit","user_fields":{"name":"Kim Bahringer"}}
```

## Pristine convention

The pristine convention is to have a selectable property as a sibling of an
[expandable](/packages/stainless/docs/expansion.md) property. So in the above example
there would be an expandable `user` property, whose type has some properties
always defined, and a selectable `user_fields` property, whose type has all properties
optional.

This allows for SDKs of all languages to provide better types for expandable fields than
if `select` could omit properties of the expandable fields.

## Select format

`select` supports subproperties via both dot and brace notation, for example:

```
-d 'select=items.user_fields{id,comments_fields{id,body}},items.comments_fields.body'
```

## Implementing select without recursive associations

You can add support for a selectable field by marking it
`.selectable()` in the response schema and adding
`expand: z.selects(...)` to your query schema:

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
  path: z.path({
    post: z.string().prismaModelLoader(prisma.post),
  }),
  query: z.query({
    select: z.selects(Post, 0).optional(),
  }),
  response: Post,
  async handler({ post }, ctx) {
    return post;
  },
});
```

`z.selects(Post, 0)` creates a schema that automatically validates
the `select` query parameter from the response properties
that are marked `.selectable()` (including any nested selectable
properties). The second argument (0) is the recursion depth limit,
which we can just set to 0 since we don't have recursion.

## Automatic Prisma integration

The `@stl-api/prisma` plugin will automatically generate the necessary
`include` for prisma queries via `ctx.prisma` or `prismaModelLoader()` when
you have declared a `.prismaModel(...)` on the response schema.

For other use cases, you will need to manually include the expanded paths in
your response.

## Implementing selection with recursive associations

When the associations are recursive, it becomes necessary to declare
input and output types for the schemas due to TypeScript limitations.
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

type UserOutput = z.output<typeof UserBase> & {
  posts_fields?: z.SelectableOutput<PostOutput[]>;
};
type UserInput = z.input<typeof UserBase> & {
  posts_fields?: z.SelectableInput<PostInput[]>;
};

const User: z.ZodType<UserOutput, z.ZodObjectDef, UserInput> = UserBase.extend({
  posts_fields: z.array(z.lazy(() => Post)).selectable(),
}).prismaModel(prisma.user);

const PostBase = z.response({
  id: z.string().uuid(),
  body: z.string(),
});

type PostOutput = z.output<typeof PostBase> & {
  user_fields?: z.SelectableOutput<UserOutput>;
};
type PostInput = z.input<typeof PostBase> & {
  user_fields?: z.SelectableInput<UserInput>;
};

const Post: z.ZodType<PostOutput, z.ZodObjectDef, PostInput> = PostBase.extend({
  user_fields: z.lazy(() => User).selectable(),
}).prismaModel(prisma.post);

export const retrieve = stl.endpoint({
  endpoint: "get /api/posts/{post}",
  path: z.path({
    post: z.string().prismaModelLoader(prisma.post),
  }),
  query: z.query({
    select: z.selects(Post, 3).optional(),
  }),
  response: Post,
  async handler({ post }, ctx) {
    return post;
  },
});
```

Now the recursion depth limit of 3 means that the following selection paths are allowed:

- `user_fields`
- `user_fields.posts_fields`
- `user_fields.posts_fields.user_fields`
- `user_fields.posts_fields.user_fields.posts_fields`

Obviously for many use cases, you would want to keep the depth limit low.

## Limitations

Right now the query parameter must be named `select`.

The maximum recursion depth supported by `z.selects` is 3.

It's not possible to generate precise types for `select` because the number
of possibilities can easily become huge. We may decide to use a different
format for `select` in the future to achieve better type safety (for example,
the same format as `expand`).
