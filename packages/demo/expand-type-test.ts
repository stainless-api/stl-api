import z from "zod";
import { extendZodForStl, Expandable } from "./libs/stlZodExtensions";
extendZodForStl(z);

type UserSchema = {
  id: number;
  name: string;
  posts?: Expandable<PostSchema[]>;
};
const UserSchema: z.ZodType<UserSchema> = z.object({
  id: z.number(),
  name: z.string(),
  posts: z.array(z.lazy(() => PostSchema)).expandable(),
});

{
  const d: Expandable<UserSchema | null> = null as any as Expandable<UserSchema>
  // @ts-expect-error
  const e: Expandable<UserSchema> = null as any as Expandable<UserSchema | undefined>
  // @ts-expect-error
  const f: Expandable<UserSchema> = null as any as Expandable<UserSchema | null>
}

type PostSchema = {
  id: number;
  body: string;
  user?: Expandable<UserSchema | null>;
};
const PostSchema: z.ZodType<PostSchema> = z.object({
  id: z.number(),
  body: z.string(),
  user: z.lazy(() => UserSchema).nullable().expandable(),
});

{
  // @ts-expect-error can't assign
  const x: UserSchema | null = null as Expandable<UserSchema>
  // @ts-expect-error can't assign
  const y: Expandable<UserSchema> = UserSchema | null
}

{
  type PostSchema = {
    id: number;
    body: string;
    user?: Expandable<UserSchema>;
  };
  // @ts-expect-error user schema type not nullable
  const PostSchema: z.ZodType<PostSchema> = z.object({
    id: z.number(),
    body: z.string(),
    user: z.lazy(() => UserSchema).nullable().expandable(),
  });
}

{
  type PostSchema = {
    id: number;
    body: string;
    user?: UserSchema;
  };
  // @ts-expect-error user schema type not expandable
  const PostSchema: z.ZodType<PostSchema> = z.object({
    id: z.number(),
    body: z.string(),
    user: z.lazy(() => UserSchema).expandable(),
  });
}


type Exact<T> = {value: T, fn: (t: T) => any}

{
  // It would be nice if we could make this error, but I don't
  // think it's possible...

  // I tried adding `fn` in:
  //
  // export type Expandable<T> = (NonNullable<T> & {
  //   readonly [expandableSymbol]?: {value: T, fn: (t: T) => any};
  // }) | null | undefined;
  //
  // But that breaks TS inferencing in ExpandablePaths


  type PostSchema = {
    id: number;
    body: string;
    user?: Expandable<UserSchema | null>;
  };
  const PostSchema: z.ZodType<PostSchema> = z.object({
    id: z.number(),
    body: z.string(),
    user: z.lazy(() => UserSchema).expandable(),
  });
}

{
  // It would be nice if we could make this error, but we need
  // UserSchema to be assignable to Expandable<UserSchema> so that
  // the output types are right...
  type PostSchema = {
    id: number;
    body: string;
    user?: Expandable<UserSchema>;
  };
  const PostSchema: z.ZodType<PostSchema> = z.object({
    id: z.number(),
    body: z.string(),
    user: z.lazy(() => UserSchema),
  });
}

{
  // It would be nice if we could make this error, but we need
  // Expandable<UserSchema> to be assignable to UserSchema so that
  // the output types are right...
  type PostSchema = {
    id: number;
    body: string;
    user?: UserSchema | null;
  };
  const PostSchema: z.ZodType<PostSchema> = z.object({
    id: z.number(),
    body: z.string(),
    user: z.lazy(() => UserSchema).expandable(),
  });
}


type E =
  | "user"
  | "user.posts"
  | "comments"
  | "comments.user"
  | "user.posts.comments";

type TopLevel<E extends string> = E extends `${infer A}.${string}` ? A : E;
type NextLevel<
  E extends string,
  Prefix extends string
> = E extends `${Prefix}.${infer B}` ? B : never;

type Top = TopLevel<E>;

type User = {
  id: number;
  name: string;
  posts?: Expandable<Post[]>;
};

type Thing = {
  id: number;
};

type Post = {
  id: number;
  body: string;
  userId: number;
  details?: string;
  user?: Expandable<User>;
  comments?: Expandable<_Comment[]>;
  thing?: Expandable<Thing | null>;
};

type _Comment = {
  id: number;
  postId: number;
  userId: number;
  body: string;
  post?: Expandable<Post>;
  user?: Expandable<User>;
};

type ExpandableKeys<Model extends object> = {
  [K in keyof Model & string]-?: NonNullable<
    Model[K]
  > extends Expandable<unknown>
    ? K
    : never;
}[keyof Model & string];

type Decrement = [0, 0, 1, 2, 3, 4, 5];

type ExpandablePaths<
  Model extends object,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3
> =
  | ExpandableKeys<Model>
  | (Depth extends 0
      ? never
      : {
          [K in keyof Model & string]-?: Model[K] extends Expandable<(infer T extends object)[]>
            ? `${K}.${ExpandablePaths<T, Decrement[Depth]>}`
            : Model[K] extends Expandable<
                null | undefined | infer T extends object
              >
            ? `${K}.${ExpandablePaths<NonNullable<T>, Decrement[Depth]>}`
            : never;
        }[keyof Model & string]);

type PostPaths = ExpandablePaths<Post, 1>;
const expand: ExpandablePaths<Post>[] = [
  "user",
  "user.posts.user",
  "comments.post.user.posts",
];

type NonExpandableKeys<Model extends object> = {
  [K in keyof Required<Model>]: NonNullable<
    Model[K]
  > extends Expandable<unknown>
    ? never
    : K;
}[keyof Model];

type NonExpandable<Model extends object> = {
  [K in NonExpandableKeys<Model>]: Model[K];
};

type X = NonNullable<Post["thing"]> extends Expandable<infer T extends object>
  ? T | undefined
  : never;

type PickExpanded<
  Model extends object,
  E extends string
> = NonExpandable<Model> & {
  [K in TopLevel<E> & keyof Model]-?: NonNullable<Model[K]> extends Expandable<
    (infer T extends object)[]
  >
    ? PickExpanded<T, NextLevel<E, K>>[]
    : NonNullable<Model[K]> extends Expandable<infer T extends object>
    ? PickExpanded<T, NextLevel<E, K>>
    : NonNullable<Model[K]> extends Expandable<null | infer T extends object>
    ? PickExpanded<T, NextLevel<E, K>> | null
    : NonNullable<Model[K]> extends Expandable<infer T>
    ? T
    : never;
};

type ExpandedPost = PickExpanded<
  Post,
  ["user.posts", "user.posts.comments", "comments.user"][number]
>;

function typeTest() {
  const post: ExpandedPost = null as any;
  post.body;
  post.comments[0]?.body;
  post.comments[0]?.user?.id;
  // @ts-expect-error not included
  post.comments[0]?.user?.posts;
  post.user.posts;
  post.user.posts[0]?.body;
  post.user.id;
  // @ts-expect-error not included
  post.user.posts[0]?.comments[0]?.user;
  // @ts-expect-error not included
  post.thing;

  const post2: PickExpanded<Post, "thing"> = null as any;
  post2.thing;
  // @ts-expect-error should be nullable
  post2.thing.id;
  post2.thing?.id;
  // @ts-expect-error not included
  post2.user;
}
