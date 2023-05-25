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

### Select format

`select` supports subproperties via both dot and brace notation, for example:

```
-d 'select=items.user_fields{id,comments_fields{id,body}},items.comments_fields.body'
```

> **Note**
>
> It's not possible to generate precise types for `select` because the number
> of possibilities can easily become huge. We may decide to use a different
> format for `select` in the future to achieve better type safety (for example,
> the same format as `expand`).

## Implementing select without recursive associations

You can add support for a selectable field by marking it
`.selectable()` in the response schema and adding
`select: z.selects(...)` to your query schema:

> **Warning**
>
> Currently, the `z.selects(...)` parameter must be named
> `select` and declared in the `query`.

> **Note**
>
> Although `.selectable()` can be called on any schema, it only works
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
`include` for prisma queries via [`ctx.prisma`](/packages/prisma/README.md#perform-crud-operations-on-response-prismamodel) or [`prismaModelLoader()`](/packages/prisma/README.md#use-prismamodelloader-on-a-parameter) when
you have [declared a `.prismaModel(...)`](/packages/prisma/README.md#declare-prismamodel-on-a-response-type) on the response schema.

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

const SelectableUser: z.ZodType<UserOutput, z.ZodObjectDef, UserInput> =
  UserBase.extend({
    posts_fields: z.array(z.lazy(() => Post)).selectable(),
  });

// .prismaModel() must be called separately so that the z.ZodType annotation
// doesn't erase its type information
const User = SelectableUser.prismaModel(prisma.user);

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

const SelectablePost: z.ZodType<PostOutput, z.ZodObjectDef, PostInput> =
  PostBase.extend({
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

> **Warning**
> The maximum recursion depth supported by `z.expands` is 5.
