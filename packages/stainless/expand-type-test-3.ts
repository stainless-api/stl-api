import z from "zod";

export const expandableSymbol = Symbol("expandable");

export type ExpandableOutput<T> =
  | (NonNullable<T> & {
      readonly [expandableSymbol]: { value: T };
    })
  | null
  | undefined;

export type ExpandableInput<T> = T | null | undefined;

export const selectableSymbol = Symbol("selectable");

export type SelectableOutput<T> =
  | (Partial<NonNullable<T>> & {
      readonly [selectableSymbol]: { value: T };
    })
  | null
  | undefined;

export type SelectableInput<T> =
  | (NonNullable<T> extends Array<infer E>
      ? Partial<E>[]
      : Partial<NonNullable<T>>)
  | null
  | undefined;

function expandable<T extends z.ZodTypeAny>(
  schema: T
): z.ZodType<
  ExpandableOutput<z.output<T>>,
  T["_def"],
  ExpandableInput<z.input<T>>
> {
  return schema as any;
}

function selectable<T extends z.ZodTypeAny>(
  schema: T
): z.ZodType<
  SelectableOutput<z.output<T>>,
  T["_def"],
  SelectableInput<z.input<T>>
> {
  return schema as any;
}

type UserSchemaOutput = {
  id: number;
  name: string;
  posts?: ExpandableOutput<PostSchemaOutput[]>;
  posts_fields?: SelectableOutput<PostSchemaOutput[]>;
};
type UserSchemaInput = {
  id: number;
  name: string;
  posts?: ExpandableInput<PostSchemaInput[]>;
  posts_fields?: SelectableInput<PostSchemaInput[]>;
};
const UserSchema: z.ZodType<UserSchemaOutput, any, UserSchemaInput> = z.object({
  id: z.number(),
  name: z.string(),
  posts: expandable(z.array(z.lazy(() => PostSchema))),
  posts_fields: selectable(z.array(z.lazy(() => PostSchema))),
});

type PostSchemaOutput = {
  id: number;
  body: string;
  user?: ExpandableOutput<UserSchemaOutput | null>;
  user_fields?: SelectableOutput<UserSchemaOutput | null>;
};
type PostSchemaInput = {
  id: number;
  body: string;
  user?: ExpandableInput<UserSchemaInput | null>;
  user_fields?: SelectableInput<UserSchemaInput | null>;
};
const PostSchema: z.ZodType<PostSchemaOutput, any, PostSchemaInput> = z.object({
  id: z.number(),
  body: z.string(),
  user: expandable(z.lazy(() => UserSchema).nullable()),
  user_fields: selectable(z.lazy(() => UserSchema).nullable()),
});

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
  posts?: ExpandableOutput<Post[]>;
};

type Thing = {
  id: number;
};

type Post = {
  id: number;
  body: string;
  userId: number;
  details?: string;
  user?: ExpandableOutput<User>;
  user_fields?: SelectableOutput<User>;
  user_blah?: User;
  comments?: ExpandableOutput<_Comment[]>;
  thing?: ExpandableOutput<Thing | null>;
};

type _Comment = {
  id: number;
  postId: number;
  userId: number;
  body: string;
  post?: ExpandableOutput<Post>;
  user?: ExpandableOutput<User>;
};

type ExpandableKeys<Model extends object> = {
  [K in keyof Model & string]-?: NonNullable<
    Model[K]
  > extends ExpandableOutput<unknown>
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
          [K in keyof Model & string]-?: Model[K] extends ExpandableOutput<
            (infer T extends object)[]
          >
            ? `${K}.${ExpandablePaths<T, Decrement[Depth]>}`
            : Model[K] extends ExpandableOutput<
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
  > extends ExpandableOutput<unknown>
    ? never
    : K;
}[keyof Model];

type NonExpandable<Model extends object> = {
  [K in NonExpandableKeys<Model>]: Model[K];
};

type X = NonNullable<Post["thing"]> extends ExpandableOutput<
  infer T extends object
>
  ? T | undefined
  : never;

type PickExpanded<
  Model extends object,
  E extends string
> = NonExpandable<Model> & {
  [K in TopLevel<E> & keyof Model]-?: NonNullable<
    Model[K]
  > extends ExpandableOutput<(infer T extends object)[]>
    ? PickExpanded<T, NextLevel<E, K>>[]
    : NonNullable<Model[K]> extends ExpandableOutput<infer T extends object>
    ? PickExpanded<T, NextLevel<E, K>>
    : NonNullable<Model[K]> extends ExpandableOutput<
        null | infer T extends object
      >
    ? PickExpanded<T, NextLevel<E, K>> | null
    : NonNullable<Model[K]> extends ExpandableOutput<infer T>
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
