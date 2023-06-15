import z from "zod";
export const CommentInclude = z.object({
  user: z.union([z.lazy(() => UserArgs), z.boolean()]).optional(),
  post: z.union([z.lazy(() => PostArgs), z.boolean()]).optional(),
});
export const QueryMode = z.object({
  default: z.literal("default"),
  insensitive: z.literal("insensitive"),
});
export const NestedUuidFilter = z.object({
  equals: z.string().optional(),
  in: z.union([z.string(), z.array(z.string())]).optional(),
  notIn: z.union([z.string(), z.array(z.string())]).optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z.union([z.string(), z.lazy(() => NestedUuidFilter)]).optional(),
});
export const UuidFilter = z.object({
  equals: z.string().optional(),
  in: z.union([z.string(), z.array(z.string())]).optional(),
  notIn: z.union([z.string(), z.array(z.string())]).optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryMode).optional(),
  not: z.union([z.string(), z.lazy(() => NestedUuidFilter)]).optional(),
});
export const NestedStringFilter = z.object({
  equals: z.string().optional(),
  in: z.union([z.string(), z.array(z.string())]).optional(),
  notIn: z.union([z.string(), z.array(z.string())]).optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([z.string(), z.lazy(() => NestedStringFilter)]).optional(),
});
export const StringFilter = z.object({
  equals: z.string().optional(),
  in: z.union([z.string(), z.array(z.string())]).optional(),
  notIn: z.union([z.string(), z.array(z.string())]).optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryMode).optional(),
  not: z.union([z.string(), z.lazy(() => NestedStringFilter)]).optional(),
});
export const NestedDateTimeFilter = z.object({
  equals: z.union([z.string(), z.date()]).optional(),
  in: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.union([z.date(), z.array(z.date())]),
    ])
    .optional(),
  notIn: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.union([z.date(), z.array(z.date())]),
    ])
    .optional(),
  lt: z.union([z.string(), z.date()]).optional(),
  lte: z.union([z.string(), z.date()]).optional(),
  gt: z.union([z.string(), z.date()]).optional(),
  gte: z.union([z.string(), z.date()]).optional(),
  not: z
    .union([z.string(), z.date(), z.lazy(() => NestedDateTimeFilter)])
    .optional(),
});
export const DateTimeFilter = z.object({
  equals: z.union([z.string(), z.date()]).optional(),
  in: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.union([z.date(), z.array(z.date())]),
    ])
    .optional(),
  notIn: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.union([z.date(), z.array(z.date())]),
    ])
    .optional(),
  lt: z.union([z.string(), z.date()]).optional(),
  lte: z.union([z.string(), z.date()]).optional(),
  gt: z.union([z.string(), z.date()]).optional(),
  gte: z.union([z.string(), z.date()]).optional(),
  not: z
    .union([z.string(), z.date(), z.lazy(() => NestedDateTimeFilter)])
    .optional(),
});
export const NestedStringNullableFilter = z.object({
  equals: z.string().nullable().optional(),
  in: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .optional(),
  notIn: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z
    .union([z.string(), z.lazy(() => NestedStringNullableFilter)])
    .nullable()
    .optional(),
});
export const StringNullableFilter = z.object({
  equals: z.string().nullable().optional(),
  in: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .optional(),
  notIn: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryMode).optional(),
  not: z
    .union([z.string(), z.lazy(() => NestedStringNullableFilter)])
    .nullable()
    .optional(),
});
export const NestedDateTimeNullableFilter = z.object({
  equals: z.union([z.string(), z.date()]).nullable().optional(),
  in: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.union([z.date(), z.array(z.date())]),
    ])
    .nullable()
    .optional(),
  notIn: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.union([z.date(), z.array(z.date())]),
    ])
    .nullable()
    .optional(),
  lt: z.union([z.string(), z.date()]).optional(),
  lte: z.union([z.string(), z.date()]).optional(),
  gt: z.union([z.string(), z.date()]).optional(),
  gte: z.union([z.string(), z.date()]).optional(),
  not: z
    .union([z.string(), z.date(), z.lazy(() => NestedDateTimeNullableFilter)])
    .nullable()
    .optional(),
});
export const DateTimeNullableFilter = z.object({
  equals: z.union([z.string(), z.date()]).nullable().optional(),
  in: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.union([z.date(), z.array(z.date())]),
    ])
    .nullable()
    .optional(),
  notIn: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.union([z.date(), z.array(z.date())]),
    ])
    .nullable()
    .optional(),
  lt: z.union([z.string(), z.date()]).optional(),
  lte: z.union([z.string(), z.date()]).optional(),
  gt: z.union([z.string(), z.date()]).optional(),
  gte: z.union([z.string(), z.date()]).optional(),
  not: z
    .union([z.string(), z.date(), z.lazy(() => NestedDateTimeNullableFilter)])
    .nullable()
    .optional(),
});
export const StringNullableListFilter = z.object({
  equals: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .optional(),
  has: z.string().nullable().optional(),
  hasEvery: z.union([z.string(), z.array(z.string())]).optional(),
  hasSome: z.union([z.string(), z.array(z.string())]).optional(),
  isEmpty: z.boolean().optional(),
});
export const NestedBoolNullableFilter = z.object({
  equals: z.boolean().nullable().optional(),
  not: z
    .union([z.lazy(() => NestedBoolNullableFilter), z.boolean()])
    .nullable()
    .optional(),
});
export const BoolNullableFilter = z.object({
  equals: z.boolean().nullable().optional(),
  not: z
    .union([z.lazy(() => NestedBoolNullableFilter), z.boolean()])
    .nullable()
    .optional(),
});
export const UserRelationFilter = z.object({
  is: z.lazy(() => UserWhereInput).optional(),
  isNot: z.lazy(() => UserWhereInput).optional(),
});
export const CommentListRelationFilter = z.object({
  every: z.lazy(() => CommentWhereInput).optional(),
  some: z.lazy(() => CommentWhereInput).optional(),
  none: z.lazy(() => CommentWhereInput).optional(),
});
export const PostWhereInput = z.object({
  AND: z
    .union([
      z.lazy(() => PostWhereInput),
      z.array(z.lazy(() => PostWhereInput)),
    ])
    .optional(),
  OR: z
    .union([
      z.lazy(() => PostWhereInput),
      z.array(z.lazy(() => PostWhereInput)),
    ])
    .optional(),
  NOT: z
    .union([
      z.lazy(() => PostWhereInput),
      z.array(z.lazy(() => PostWhereInput)),
    ])
    .optional(),
  id: z.union([z.string(), z.lazy(() => UuidFilter)]).optional(),
  body: z.union([z.string(), z.lazy(() => StringFilter)]).optional(),
  createdAt: z
    .union([z.string(), z.lazy(() => DateTimeFilter), z.date()])
    .optional(),
  updatedAt: z
    .union([z.string(), z.lazy(() => DateTimeFilter), z.date()])
    .optional(),
  userId: z.union([z.string(), z.lazy(() => UuidFilter)]).optional(),
  likedIds: z.lazy(() => StringNullableListFilter).optional(),
  image: z
    .union([z.string(), z.lazy(() => StringNullableFilter)])
    .nullable()
    .optional(),
  user: z
    .union([
      z
        .object({ is: z.undefined(), isNot: z.undefined() })
        .and(z.lazy(() => UserWhereInput)),
      z
        .object({
          AND: z.undefined(),
          OR: z.undefined(),
          NOT: z.undefined(),
          id: z.undefined(),
          name: z.undefined(),
          username: z.undefined(),
          bio: z.undefined(),
          email: z.undefined(),
          emailVerified: z.undefined(),
          image: z.undefined(),
          coverImage: z.undefined(),
          profileImage: z.undefined(),
          hashedPassword: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          followingIds: z.undefined(),
          hasNotification: z.undefined(),
          posts: z.undefined(),
          comments: z.undefined(),
          notifications: z.undefined(),
        })
        .and(z.lazy(() => UserRelationFilter)),
    ])
    .optional(),
  comments: z.lazy(() => CommentListRelationFilter).optional(),
});
export const PostListRelationFilter = z.object({
  every: z.lazy(() => PostWhereInput).optional(),
  some: z.lazy(() => PostWhereInput).optional(),
  none: z.lazy(() => PostWhereInput).optional(),
});
export const NotificationWhereInput = z.object({
  AND: z
    .union([
      z.lazy(() => NotificationWhereInput),
      z.array(z.lazy(() => NotificationWhereInput)),
    ])
    .optional(),
  OR: z
    .union([
      z.lazy(() => NotificationWhereInput),
      z.array(z.lazy(() => NotificationWhereInput)),
    ])
    .optional(),
  NOT: z
    .union([
      z.lazy(() => NotificationWhereInput),
      z.array(z.lazy(() => NotificationWhereInput)),
    ])
    .optional(),
  id: z.union([z.string(), z.lazy(() => UuidFilter)]).optional(),
  body: z.union([z.string(), z.lazy(() => StringFilter)]).optional(),
  userId: z.union([z.string(), z.lazy(() => UuidFilter)]).optional(),
  createdAt: z
    .union([z.string(), z.lazy(() => DateTimeFilter), z.date()])
    .optional(),
  user: z
    .union([
      z
        .object({ is: z.undefined(), isNot: z.undefined() })
        .and(z.lazy(() => UserWhereInput)),
      z
        .object({
          AND: z.undefined(),
          OR: z.undefined(),
          NOT: z.undefined(),
          id: z.undefined(),
          name: z.undefined(),
          username: z.undefined(),
          bio: z.undefined(),
          email: z.undefined(),
          emailVerified: z.undefined(),
          image: z.undefined(),
          coverImage: z.undefined(),
          profileImage: z.undefined(),
          hashedPassword: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          followingIds: z.undefined(),
          hasNotification: z.undefined(),
          posts: z.undefined(),
          comments: z.undefined(),
          notifications: z.undefined(),
        })
        .and(z.lazy(() => UserRelationFilter)),
    ])
    .optional(),
});
export const NotificationListRelationFilter = z.object({
  every: z.lazy(() => NotificationWhereInput).optional(),
  some: z.lazy(() => NotificationWhereInput).optional(),
  none: z.lazy(() => NotificationWhereInput).optional(),
});
export const UserWhereInput = z.object({
  AND: z
    .union([
      z.lazy(() => UserWhereInput),
      z.array(z.lazy(() => UserWhereInput)),
    ])
    .optional(),
  OR: z
    .union([
      z.lazy(() => UserWhereInput),
      z.array(z.lazy(() => UserWhereInput)),
    ])
    .optional(),
  NOT: z
    .union([
      z.lazy(() => UserWhereInput),
      z.array(z.lazy(() => UserWhereInput)),
    ])
    .optional(),
  id: z.union([z.string(), z.lazy(() => UuidFilter)]).optional(),
  name: z
    .union([z.string(), z.lazy(() => StringNullableFilter)])
    .nullable()
    .optional(),
  username: z
    .union([z.string(), z.lazy(() => StringNullableFilter)])
    .nullable()
    .optional(),
  bio: z
    .union([z.string(), z.lazy(() => StringNullableFilter)])
    .nullable()
    .optional(),
  email: z
    .union([z.string(), z.lazy(() => StringNullableFilter)])
    .nullable()
    .optional(),
  emailVerified: z
    .union([z.string(), z.date(), z.lazy(() => DateTimeNullableFilter)])
    .nullable()
    .optional(),
  image: z
    .union([z.string(), z.lazy(() => StringNullableFilter)])
    .nullable()
    .optional(),
  coverImage: z
    .union([z.string(), z.lazy(() => StringNullableFilter)])
    .nullable()
    .optional(),
  profileImage: z
    .union([z.string(), z.lazy(() => StringNullableFilter)])
    .nullable()
    .optional(),
  hashedPassword: z
    .union([z.string(), z.lazy(() => StringNullableFilter)])
    .nullable()
    .optional(),
  createdAt: z
    .union([z.string(), z.lazy(() => DateTimeFilter), z.date()])
    .optional(),
  updatedAt: z
    .union([z.string(), z.lazy(() => DateTimeFilter), z.date()])
    .optional(),
  followingIds: z.lazy(() => StringNullableListFilter).optional(),
  hasNotification: z
    .union([z.lazy(() => BoolNullableFilter), z.boolean()])
    .nullable()
    .optional(),
  posts: z.lazy(() => PostListRelationFilter).optional(),
  comments: z.lazy(() => CommentListRelationFilter).optional(),
  notifications: z.lazy(() => NotificationListRelationFilter).optional(),
});
export const PostRelationFilter = z.object({
  is: z.lazy(() => PostWhereInput).optional(),
  isNot: z.lazy(() => PostWhereInput).optional(),
});
export const CommentWhereInput = z.object({
  AND: z
    .union([
      z.lazy(() => CommentWhereInput),
      z.array(z.lazy(() => CommentWhereInput)),
    ])
    .optional(),
  OR: z
    .union([
      z.lazy(() => CommentWhereInput),
      z.array(z.lazy(() => CommentWhereInput)),
    ])
    .optional(),
  NOT: z
    .union([
      z.lazy(() => CommentWhereInput),
      z.array(z.lazy(() => CommentWhereInput)),
    ])
    .optional(),
  id: z.union([z.string(), z.lazy(() => UuidFilter)]).optional(),
  body: z.union([z.string(), z.lazy(() => StringFilter)]).optional(),
  createdAt: z
    .union([z.string(), z.lazy(() => DateTimeFilter), z.date()])
    .optional(),
  updatedAt: z
    .union([z.string(), z.lazy(() => DateTimeFilter), z.date()])
    .optional(),
  userId: z.union([z.string(), z.lazy(() => UuidFilter)]).optional(),
  postId: z.union([z.string(), z.lazy(() => UuidFilter)]).optional(),
  user: z
    .union([
      z
        .object({ is: z.undefined(), isNot: z.undefined() })
        .and(z.lazy(() => UserWhereInput)),
      z
        .object({
          AND: z.undefined(),
          OR: z.undefined(),
          NOT: z.undefined(),
          id: z.undefined(),
          name: z.undefined(),
          username: z.undefined(),
          bio: z.undefined(),
          email: z.undefined(),
          emailVerified: z.undefined(),
          image: z.undefined(),
          coverImage: z.undefined(),
          profileImage: z.undefined(),
          hashedPassword: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          followingIds: z.undefined(),
          hasNotification: z.undefined(),
          posts: z.undefined(),
          comments: z.undefined(),
          notifications: z.undefined(),
        })
        .and(z.lazy(() => UserRelationFilter)),
    ])
    .optional(),
  post: z
    .union([
      z
        .object({ is: z.undefined(), isNot: z.undefined() })
        .and(z.lazy(() => PostWhereInput)),
      z
        .object({
          AND: z.undefined(),
          OR: z.undefined(),
          NOT: z.undefined(),
          id: z.undefined(),
          image: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          comments: z.undefined(),
          body: z.undefined(),
          userId: z.undefined(),
          likedIds: z.undefined(),
          user: z.undefined(),
        })
        .and(z.lazy(() => PostRelationFilter)),
    ])
    .optional(),
});
export const SortOrder = z.object({
  asc: z.literal("asc"),
  desc: z.literal("desc"),
});
export const PostOrderByRelationAggregateInput = z.object({
  _count: z.lazy(() => SortOrder).optional(),
});
export const CommentOrderByRelationAggregateInput = z.object({
  _count: z.lazy(() => SortOrder).optional(),
});
export const NotificationOrderByRelationAggregateInput = z.object({
  _count: z.lazy(() => SortOrder).optional(),
});
export const UserOrderByWithRelationInput = z.object({
  id: z.lazy(() => SortOrder).optional(),
  name: z.lazy(() => SortOrder).optional(),
  username: z.lazy(() => SortOrder).optional(),
  bio: z.lazy(() => SortOrder).optional(),
  email: z.lazy(() => SortOrder).optional(),
  emailVerified: z.lazy(() => SortOrder).optional(),
  image: z.lazy(() => SortOrder).optional(),
  coverImage: z.lazy(() => SortOrder).optional(),
  profileImage: z.lazy(() => SortOrder).optional(),
  hashedPassword: z.lazy(() => SortOrder).optional(),
  createdAt: z.lazy(() => SortOrder).optional(),
  updatedAt: z.lazy(() => SortOrder).optional(),
  followingIds: z.lazy(() => SortOrder).optional(),
  hasNotification: z.lazy(() => SortOrder).optional(),
  posts: z.lazy(() => PostOrderByRelationAggregateInput).optional(),
  comments: z.lazy(() => CommentOrderByRelationAggregateInput).optional(),
  notifications: z
    .lazy(() => NotificationOrderByRelationAggregateInput)
    .optional(),
});
export const PostOrderByWithRelationInput = z.object({
  id: z.lazy(() => SortOrder).optional(),
  body: z.lazy(() => SortOrder).optional(),
  createdAt: z.lazy(() => SortOrder).optional(),
  updatedAt: z.lazy(() => SortOrder).optional(),
  userId: z.lazy(() => SortOrder).optional(),
  likedIds: z.lazy(() => SortOrder).optional(),
  image: z.lazy(() => SortOrder).optional(),
  user: z.lazy(() => UserOrderByWithRelationInput).optional(),
  comments: z.lazy(() => CommentOrderByRelationAggregateInput).optional(),
});
export const CommentOrderByWithRelationInput = z.object({
  id: z.lazy(() => SortOrder).optional(),
  body: z.lazy(() => SortOrder).optional(),
  createdAt: z.lazy(() => SortOrder).optional(),
  updatedAt: z.lazy(() => SortOrder).optional(),
  userId: z.lazy(() => SortOrder).optional(),
  postId: z.lazy(() => SortOrder).optional(),
  user: z.lazy(() => UserOrderByWithRelationInput).optional(),
  post: z.lazy(() => PostOrderByWithRelationInput).optional(),
});
export const CommentWhereUniqueInput = z.object({ id: z.string().optional() });
export const CommentScalarFieldEnum = z.object({
  id: z.literal("id"),
  body: z.literal("body"),
  createdAt: z.literal("createdAt"),
  updatedAt: z.literal("updatedAt"),
  userId: z.literal("userId"),
  postId: z.literal("postId"),
});
export const Post$commentsArgs = z.object({
  select: z
    .lazy(() => CommentSelect)
    .nullable()
    .optional(),
  include: z
    .lazy(() => CommentInclude)
    .nullable()
    .optional(),
  where: z.lazy(() => CommentWhereInput).optional(),
  orderBy: z
    .union([
      z.lazy(() => CommentOrderByWithRelationInput),
      z.array(z.lazy(() => CommentOrderByWithRelationInput)),
    ])
    .optional(),
  cursor: z.lazy(() => CommentWhereUniqueInput).optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z
    .union([
      z.lazy(() => CommentScalarFieldEnum),
      z.array(z.lazy(() => CommentScalarFieldEnum)),
    ])
    .optional(),
});
export const PostCountOutputTypeSelect = z.object({
  comments: z.boolean().optional(),
});
export const PostCountOutputTypeArgs = z.object({
  select: z
    .lazy(() => PostCountOutputTypeSelect)
    .nullable()
    .optional(),
});
export const PostInclude = z.object({
  user: z.union([z.lazy(() => UserArgs), z.boolean()]).optional(),
  comments: z.union([z.lazy(() => Post$commentsArgs), z.boolean()]).optional(),
  _count: z
    .union([z.lazy(() => PostCountOutputTypeArgs), z.boolean()])
    .optional(),
});
export const PostArgs = z.object({
  select: z
    .lazy(() => PostSelect)
    .nullable()
    .optional(),
  include: z
    .lazy(() => PostInclude)
    .nullable()
    .optional(),
});
export const CommentSelect = z.object({
  id: z.boolean().optional(),
  body: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  postId: z.boolean().optional(),
  user: z.union([z.lazy(() => UserArgs), z.boolean()]).optional(),
  post: z.union([z.lazy(() => PostArgs), z.boolean()]).optional(),
});
export const User$commentsArgs = z.object({
  select: z
    .lazy(() => CommentSelect)
    .nullable()
    .optional(),
  include: z
    .lazy(() => CommentInclude)
    .nullable()
    .optional(),
  where: z.lazy(() => CommentWhereInput).optional(),
  orderBy: z
    .union([
      z.lazy(() => CommentOrderByWithRelationInput),
      z.array(z.lazy(() => CommentOrderByWithRelationInput)),
    ])
    .optional(),
  cursor: z.lazy(() => CommentWhereUniqueInput).optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z
    .union([
      z.lazy(() => CommentScalarFieldEnum),
      z.array(z.lazy(() => CommentScalarFieldEnum)),
    ])
    .optional(),
});
export const NotificationSelect = z.object({
  id: z.boolean().optional(),
  body: z.boolean().optional(),
  userId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  user: z.union([z.lazy(() => UserArgs), z.boolean()]).optional(),
});
export const NotificationInclude = z.object({
  user: z.union([z.lazy(() => UserArgs), z.boolean()]).optional(),
});
export const NotificationOrderByWithRelationInput = z.object({
  id: z.lazy(() => SortOrder).optional(),
  body: z.lazy(() => SortOrder).optional(),
  userId: z.lazy(() => SortOrder).optional(),
  createdAt: z.lazy(() => SortOrder).optional(),
  user: z.lazy(() => UserOrderByWithRelationInput).optional(),
});
export const NotificationWhereUniqueInput = z.object({
  id: z.string().optional(),
});
export const NotificationScalarFieldEnum = z.object({
  id: z.literal("id"),
  body: z.literal("body"),
  userId: z.literal("userId"),
  createdAt: z.literal("createdAt"),
});
export const User$notificationsArgs = z.object({
  select: z
    .lazy(() => NotificationSelect)
    .nullable()
    .optional(),
  include: z
    .lazy(() => NotificationInclude)
    .nullable()
    .optional(),
  where: z.lazy(() => NotificationWhereInput).optional(),
  orderBy: z
    .union([
      z.lazy(() => NotificationOrderByWithRelationInput),
      z.array(z.lazy(() => NotificationOrderByWithRelationInput)),
    ])
    .optional(),
  cursor: z.lazy(() => NotificationWhereUniqueInput).optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z
    .union([
      z.lazy(() => NotificationScalarFieldEnum),
      z.array(z.lazy(() => NotificationScalarFieldEnum)),
    ])
    .optional(),
});
export const UserCountOutputTypeSelect = z.object({
  posts: z.boolean().optional(),
  comments: z.boolean().optional(),
  notifications: z.boolean().optional(),
});
export const UserCountOutputTypeArgs = z.object({
  select: z
    .lazy(() => UserCountOutputTypeSelect)
    .nullable()
    .optional(),
});
export const UserInclude = z.object({
  posts: z.union([z.lazy(() => User$postsArgs), z.boolean()]).optional(),
  comments: z.union([z.lazy(() => User$commentsArgs), z.boolean()]).optional(),
  notifications: z
    .union([z.lazy(() => User$notificationsArgs), z.boolean()])
    .optional(),
  _count: z
    .union([z.lazy(() => UserCountOutputTypeArgs), z.boolean()])
    .optional(),
});
export const UserArgs = z.object({
  select: z
    .lazy(() => UserSelect)
    .nullable()
    .optional(),
  include: z
    .lazy(() => UserInclude)
    .nullable()
    .optional(),
});
export const PostSelect = z.object({
  id: z.boolean().optional(),
  body: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  likedIds: z.boolean().optional(),
  image: z.boolean().optional(),
  user: z.union([z.lazy(() => UserArgs), z.boolean()]).optional(),
  comments: z.union([z.lazy(() => Post$commentsArgs), z.boolean()]).optional(),
  _count: z
    .union([z.lazy(() => PostCountOutputTypeArgs), z.boolean()])
    .optional(),
});
export const PostWhereUniqueInput = z.object({ id: z.string().optional() });
export const PostScalarFieldEnum = z.object({
  id: z.literal("id"),
  body: z.literal("body"),
  createdAt: z.literal("createdAt"),
  updatedAt: z.literal("updatedAt"),
  userId: z.literal("userId"),
  likedIds: z.literal("likedIds"),
  image: z.literal("image"),
});
export const User$postsArgs = z.object({
  select: z
    .lazy(() => PostSelect)
    .nullable()
    .optional(),
  include: z
    .lazy(() => PostInclude)
    .nullable()
    .optional(),
  where: z.lazy(() => PostWhereInput).optional(),
  orderBy: z
    .union([
      z.lazy(() => PostOrderByWithRelationInput),
      z.array(z.lazy(() => PostOrderByWithRelationInput)),
    ])
    .optional(),
  cursor: z.lazy(() => PostWhereUniqueInput).optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z
    .union([
      z.lazy(() => PostScalarFieldEnum),
      z.array(z.lazy(() => PostScalarFieldEnum)),
    ])
    .optional(),
});
export const UserSelect = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  username: z.boolean().optional(),
  bio: z.boolean().optional(),
  email: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  image: z.boolean().optional(),
  coverImage: z.boolean().optional(),
  profileImage: z.boolean().optional(),
  hashedPassword: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  followingIds: z.boolean().optional(),
  hasNotification: z.boolean().optional(),
  posts: z.union([z.lazy(() => User$postsArgs), z.boolean()]).optional(),
  comments: z.union([z.lazy(() => User$commentsArgs), z.boolean()]).optional(),
  notifications: z
    .union([z.lazy(() => User$notificationsArgs), z.boolean()])
    .optional(),
  _count: z
    .union([z.lazy(() => UserCountOutputTypeArgs), z.boolean()])
    .optional(),
});
export const UserCreatefollowingIdsInput = z.object({
  set: z.union([z.string(), z.array(z.string())]),
});
export const PostCreatelikedIdsInput = z.object({
  set: z.union([z.string(), z.array(z.string())]),
});
export const CommentUncheckedCreateWithoutPostInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  userId: z.string(),
});
export const NotificationUncheckedCreateWithoutUserInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
});
export const NotificationCreateWithoutUserInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
});
export const NotificationCreateOrConnectWithoutUserInput = z.object({
  where: z.lazy(() => NotificationWhereUniqueInput),
  create: z.union([
    z.object({}).and(z.lazy(() => NotificationUncheckedCreateWithoutUserInput)),
    z.object({}).and(z.lazy(() => NotificationCreateWithoutUserInput)),
  ]),
});
export const NotificationCreateManyUserInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
});
export const NotificationCreateManyUserInputEnvelope = z.object({
  data: z.union([
    z.lazy(() => NotificationCreateManyUserInput),
    z.array(z.lazy(() => NotificationCreateManyUserInput)),
  ]),
  skipDuplicates: z.boolean().optional(),
});
export const NotificationUncheckedCreateNestedManyWithoutUserInput = z.object({
  create: z
    .union([
      z
        .object({})
        .and(z.lazy(() => NotificationUncheckedCreateWithoutUserInput)),
      z.object({}).and(z.lazy(() => NotificationCreateWithoutUserInput)),
      z
        .object({
          id: z.undefined(),
          createdAt: z.undefined(),
          body: z.undefined(),
        })
        .and(
          z.array(z.lazy(() => NotificationUncheckedCreateWithoutUserInput))
        ),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => NotificationCreateWithoutUserInput)),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => NotificationUncheckedCreateWithoutUserInput)),
      z
        .object({
          id: z.undefined(),
          createdAt: z.undefined(),
          body: z.undefined(),
        })
        .and(z.array(z.lazy(() => NotificationCreateWithoutUserInput))),
      z
        .object({})
        .and(
          z.array(z.lazy(() => NotificationUncheckedCreateWithoutUserInput))
        ),
      z
        .object({})
        .and(z.array(z.lazy(() => NotificationCreateWithoutUserInput))),
    ])
    .optional(),
  connectOrCreate: z
    .union([
      z.lazy(() => NotificationCreateOrConnectWithoutUserInput),
      z.array(z.lazy(() => NotificationCreateOrConnectWithoutUserInput)),
    ])
    .optional(),
  createMany: z.lazy(() => NotificationCreateManyUserInputEnvelope).optional(),
  connect: z
    .union([
      z.lazy(() => NotificationWhereUniqueInput),
      z.array(z.lazy(() => NotificationWhereUniqueInput)),
    ])
    .optional(),
});
export const UserUncheckedCreateWithoutCommentsInput = z.object({
  id: z.string().optional(),
  name: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  emailVerified: z.union([z.string(), z.date()]).nullable().optional(),
  image: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
  hashedPassword: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  followingIds: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.lazy(() => UserCreatefollowingIdsInput),
    ])
    .optional(),
  hasNotification: z.boolean().nullable().optional(),
  posts: z.lazy(() => PostUncheckedCreateNestedManyWithoutUserInput).optional(),
  notifications: z
    .lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInput)
    .optional(),
});
export const CommentCreateOrConnectWithoutPostInput = z.object({
  where: z.lazy(() => CommentWhereUniqueInput),
  create: z.union([
    z
      .object({ user: z.undefined() })
      .and(z.lazy(() => CommentUncheckedCreateWithoutPostInput)),
    z
      .object({ userId: z.undefined() })
      .and(z.lazy(() => CommentCreateWithoutPostInput)),
  ]),
});
export const CommentCreateManyPostInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  userId: z.string(),
});
export const CommentCreateManyPostInputEnvelope = z.object({
  data: z.union([
    z.lazy(() => CommentCreateManyPostInput),
    z.array(z.lazy(() => CommentCreateManyPostInput)),
  ]),
  skipDuplicates: z.boolean().optional(),
});
export const CommentCreateNestedManyWithoutPostInput = z.object({
  create: z
    .union([
      z
        .object({ user: z.undefined() })
        .and(z.lazy(() => CommentUncheckedCreateWithoutPostInput)),
      z
        .object({ userId: z.undefined() })
        .and(z.lazy(() => CommentCreateWithoutPostInput)),
      z
        .object({
          id: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          body: z.undefined(),
          user: z.undefined(),
        })
        .and(z.array(z.lazy(() => CommentUncheckedCreateWithoutPostInput))),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => CommentCreateWithoutPostInput)),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => CommentUncheckedCreateWithoutPostInput)),
      z
        .object({
          id: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          body: z.undefined(),
          userId: z.undefined(),
        })
        .and(z.array(z.lazy(() => CommentCreateWithoutPostInput))),
      z
        .object({})
        .and(z.array(z.lazy(() => CommentUncheckedCreateWithoutPostInput))),
      z.object({}).and(z.array(z.lazy(() => CommentCreateWithoutPostInput))),
    ])
    .optional(),
  connectOrCreate: z
    .union([
      z.lazy(() => CommentCreateOrConnectWithoutPostInput),
      z.array(z.lazy(() => CommentCreateOrConnectWithoutPostInput)),
    ])
    .optional(),
  createMany: z.lazy(() => CommentCreateManyPostInputEnvelope).optional(),
  connect: z
    .union([
      z.lazy(() => CommentWhereUniqueInput),
      z.array(z.lazy(() => CommentWhereUniqueInput)),
    ])
    .optional(),
});
export const PostCreateWithoutUserInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  likedIds: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.lazy(() => PostCreatelikedIdsInput),
    ])
    .optional(),
  image: z.string().nullable().optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutPostInput).optional(),
});
export const PostCreateOrConnectWithoutUserInput = z.object({
  where: z.lazy(() => PostWhereUniqueInput),
  create: z.union([
    z.object({}).and(z.lazy(() => PostUncheckedCreateWithoutUserInput)),
    z.object({}).and(z.lazy(() => PostCreateWithoutUserInput)),
  ]),
});
export const PostCreateManyUserInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  likedIds: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.lazy(() => PostCreatelikedIdsInput),
    ])
    .optional(),
  image: z.string().nullable().optional(),
});
export const PostCreateManyUserInputEnvelope = z.object({
  data: z.union([
    z.lazy(() => PostCreateManyUserInput),
    z.array(z.lazy(() => PostCreateManyUserInput)),
  ]),
  skipDuplicates: z.boolean().optional(),
});
export const PostCreateNestedManyWithoutUserInput = z.object({
  create: z
    .union([
      z.object({}).and(z.lazy(() => PostUncheckedCreateWithoutUserInput)),
      z.object({}).and(z.lazy(() => PostCreateWithoutUserInput)),
      z
        .object({
          id: z.undefined(),
          image: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          comments: z.undefined(),
          body: z.undefined(),
          likedIds: z.undefined(),
        })
        .and(z.array(z.lazy(() => PostUncheckedCreateWithoutUserInput))),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => PostCreateWithoutUserInput)),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => PostUncheckedCreateWithoutUserInput)),
      z
        .object({
          id: z.undefined(),
          image: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          comments: z.undefined(),
          body: z.undefined(),
          likedIds: z.undefined(),
        })
        .and(z.array(z.lazy(() => PostCreateWithoutUserInput))),
      z
        .object({})
        .and(z.array(z.lazy(() => PostUncheckedCreateWithoutUserInput))),
      z.object({}).and(z.array(z.lazy(() => PostCreateWithoutUserInput))),
    ])
    .optional(),
  connectOrCreate: z
    .union([
      z.lazy(() => PostCreateOrConnectWithoutUserInput),
      z.array(z.lazy(() => PostCreateOrConnectWithoutUserInput)),
    ])
    .optional(),
  createMany: z.lazy(() => PostCreateManyUserInputEnvelope).optional(),
  connect: z
    .union([
      z.lazy(() => PostWhereUniqueInput),
      z.array(z.lazy(() => PostWhereUniqueInput)),
    ])
    .optional(),
});
export const NotificationCreateNestedManyWithoutUserInput = z.object({
  create: z
    .union([
      z
        .object({})
        .and(z.lazy(() => NotificationUncheckedCreateWithoutUserInput)),
      z.object({}).and(z.lazy(() => NotificationCreateWithoutUserInput)),
      z
        .object({
          id: z.undefined(),
          createdAt: z.undefined(),
          body: z.undefined(),
        })
        .and(
          z.array(z.lazy(() => NotificationUncheckedCreateWithoutUserInput))
        ),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => NotificationCreateWithoutUserInput)),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => NotificationUncheckedCreateWithoutUserInput)),
      z
        .object({
          id: z.undefined(),
          createdAt: z.undefined(),
          body: z.undefined(),
        })
        .and(z.array(z.lazy(() => NotificationCreateWithoutUserInput))),
      z
        .object({})
        .and(
          z.array(z.lazy(() => NotificationUncheckedCreateWithoutUserInput))
        ),
      z
        .object({})
        .and(z.array(z.lazy(() => NotificationCreateWithoutUserInput))),
    ])
    .optional(),
  connectOrCreate: z
    .union([
      z.lazy(() => NotificationCreateOrConnectWithoutUserInput),
      z.array(z.lazy(() => NotificationCreateOrConnectWithoutUserInput)),
    ])
    .optional(),
  createMany: z.lazy(() => NotificationCreateManyUserInputEnvelope).optional(),
  connect: z
    .union([
      z.lazy(() => NotificationWhereUniqueInput),
      z.array(z.lazy(() => NotificationWhereUniqueInput)),
    ])
    .optional(),
});
export const UserCreateWithoutCommentsInput = z.object({
  id: z.string().optional(),
  name: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  emailVerified: z.union([z.string(), z.date()]).nullable().optional(),
  image: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
  hashedPassword: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  followingIds: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.lazy(() => UserCreatefollowingIdsInput),
    ])
    .optional(),
  hasNotification: z.boolean().nullable().optional(),
  posts: z.lazy(() => PostCreateNestedManyWithoutUserInput).optional(),
  notifications: z
    .lazy(() => NotificationCreateNestedManyWithoutUserInput)
    .optional(),
});
export const UserWhereUniqueInput = z.object({
  id: z.string().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
});
export const UserCreateOrConnectWithoutCommentsInput = z.object({
  where: z.lazy(() => UserWhereUniqueInput),
  create: z.union([
    z.object({}).and(z.lazy(() => UserUncheckedCreateWithoutCommentsInput)),
    z.object({}).and(z.lazy(() => UserCreateWithoutCommentsInput)),
  ]),
});
export const UserCreateNestedOneWithoutCommentsInput = z.object({
  create: z
    .union([
      z.object({}).and(z.lazy(() => UserUncheckedCreateWithoutCommentsInput)),
      z.object({}).and(z.lazy(() => UserCreateWithoutCommentsInput)),
    ])
    .optional(),
  connectOrCreate: z
    .lazy(() => UserCreateOrConnectWithoutCommentsInput)
    .optional(),
  connect: z.lazy(() => UserWhereUniqueInput).optional(),
});
export const CommentCreateWithoutPostInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutCommentsInput),
});
export const CommentUncheckedCreateNestedManyWithoutPostInput = z.object({
  create: z
    .union([
      z
        .object({ user: z.undefined() })
        .and(z.lazy(() => CommentUncheckedCreateWithoutPostInput)),
      z
        .object({ userId: z.undefined() })
        .and(z.lazy(() => CommentCreateWithoutPostInput)),
      z
        .object({
          id: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          body: z.undefined(),
          user: z.undefined(),
        })
        .and(z.array(z.lazy(() => CommentUncheckedCreateWithoutPostInput))),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => CommentCreateWithoutPostInput)),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => CommentUncheckedCreateWithoutPostInput)),
      z
        .object({
          id: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          body: z.undefined(),
          userId: z.undefined(),
        })
        .and(z.array(z.lazy(() => CommentCreateWithoutPostInput))),
      z
        .object({})
        .and(z.array(z.lazy(() => CommentUncheckedCreateWithoutPostInput))),
      z.object({}).and(z.array(z.lazy(() => CommentCreateWithoutPostInput))),
    ])
    .optional(),
  connectOrCreate: z
    .union([
      z.lazy(() => CommentCreateOrConnectWithoutPostInput),
      z.array(z.lazy(() => CommentCreateOrConnectWithoutPostInput)),
    ])
    .optional(),
  createMany: z.lazy(() => CommentCreateManyPostInputEnvelope).optional(),
  connect: z
    .union([
      z.lazy(() => CommentWhereUniqueInput),
      z.array(z.lazy(() => CommentWhereUniqueInput)),
    ])
    .optional(),
});
export const PostUncheckedCreateWithoutUserInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  likedIds: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.lazy(() => PostCreatelikedIdsInput),
    ])
    .optional(),
  image: z.string().nullable().optional(),
  comments: z
    .lazy(() => CommentUncheckedCreateNestedManyWithoutPostInput)
    .optional(),
});
export const PostUncheckedCreateNestedManyWithoutUserInput = z.object({
  create: z
    .union([
      z.object({}).and(z.lazy(() => PostUncheckedCreateWithoutUserInput)),
      z.object({}).and(z.lazy(() => PostCreateWithoutUserInput)),
      z
        .object({
          id: z.undefined(),
          image: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          comments: z.undefined(),
          body: z.undefined(),
          likedIds: z.undefined(),
        })
        .and(z.array(z.lazy(() => PostUncheckedCreateWithoutUserInput))),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => PostCreateWithoutUserInput)),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => PostUncheckedCreateWithoutUserInput)),
      z
        .object({
          id: z.undefined(),
          image: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          comments: z.undefined(),
          body: z.undefined(),
          likedIds: z.undefined(),
        })
        .and(z.array(z.lazy(() => PostCreateWithoutUserInput))),
      z
        .object({})
        .and(z.array(z.lazy(() => PostUncheckedCreateWithoutUserInput))),
      z.object({}).and(z.array(z.lazy(() => PostCreateWithoutUserInput))),
    ])
    .optional(),
  connectOrCreate: z
    .union([
      z.lazy(() => PostCreateOrConnectWithoutUserInput),
      z.array(z.lazy(() => PostCreateOrConnectWithoutUserInput)),
    ])
    .optional(),
  createMany: z.lazy(() => PostCreateManyUserInputEnvelope).optional(),
  connect: z
    .union([
      z.lazy(() => PostWhereUniqueInput),
      z.array(z.lazy(() => PostWhereUniqueInput)),
    ])
    .optional(),
});
export const CommentUncheckedCreateWithoutUserInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  postId: z.string(),
});
export const PostUncheckedCreateWithoutCommentsInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  userId: z.string(),
  likedIds: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.lazy(() => PostCreatelikedIdsInput),
    ])
    .optional(),
  image: z.string().nullable().optional(),
});
export const UserUncheckedCreateWithoutPostsInput = z.object({
  id: z.string().optional(),
  name: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  emailVerified: z.union([z.string(), z.date()]).nullable().optional(),
  image: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
  hashedPassword: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  followingIds: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.lazy(() => UserCreatefollowingIdsInput),
    ])
    .optional(),
  hasNotification: z.boolean().nullable().optional(),
  comments: z
    .lazy(() => CommentUncheckedCreateNestedManyWithoutUserInput)
    .optional(),
  notifications: z
    .lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInput)
    .optional(),
});
export const CommentCreateOrConnectWithoutUserInput = z.object({
  where: z.lazy(() => CommentWhereUniqueInput),
  create: z.union([
    z
      .object({ post: z.undefined() })
      .and(z.lazy(() => CommentUncheckedCreateWithoutUserInput)),
    z
      .object({ postId: z.undefined() })
      .and(z.lazy(() => CommentCreateWithoutUserInput)),
  ]),
});
export const CommentCreateManyUserInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  postId: z.string(),
});
export const CommentCreateManyUserInputEnvelope = z.object({
  data: z.union([
    z.lazy(() => CommentCreateManyUserInput),
    z.array(z.lazy(() => CommentCreateManyUserInput)),
  ]),
  skipDuplicates: z.boolean().optional(),
});
export const CommentCreateNestedManyWithoutUserInput = z.object({
  create: z
    .union([
      z
        .object({ post: z.undefined() })
        .and(z.lazy(() => CommentUncheckedCreateWithoutUserInput)),
      z
        .object({ postId: z.undefined() })
        .and(z.lazy(() => CommentCreateWithoutUserInput)),
      z
        .object({
          id: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          body: z.undefined(),
          post: z.undefined(),
        })
        .and(z.array(z.lazy(() => CommentUncheckedCreateWithoutUserInput))),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => CommentCreateWithoutUserInput)),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => CommentUncheckedCreateWithoutUserInput)),
      z
        .object({
          id: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          body: z.undefined(),
          postId: z.undefined(),
        })
        .and(z.array(z.lazy(() => CommentCreateWithoutUserInput))),
      z
        .object({})
        .and(z.array(z.lazy(() => CommentUncheckedCreateWithoutUserInput))),
      z.object({}).and(z.array(z.lazy(() => CommentCreateWithoutUserInput))),
    ])
    .optional(),
  connectOrCreate: z
    .union([
      z.lazy(() => CommentCreateOrConnectWithoutUserInput),
      z.array(z.lazy(() => CommentCreateOrConnectWithoutUserInput)),
    ])
    .optional(),
  createMany: z.lazy(() => CommentCreateManyUserInputEnvelope).optional(),
  connect: z
    .union([
      z.lazy(() => CommentWhereUniqueInput),
      z.array(z.lazy(() => CommentWhereUniqueInput)),
    ])
    .optional(),
});
export const UserCreateWithoutPostsInput = z.object({
  id: z.string().optional(),
  name: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  emailVerified: z.union([z.string(), z.date()]).nullable().optional(),
  image: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
  hashedPassword: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  followingIds: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.lazy(() => UserCreatefollowingIdsInput),
    ])
    .optional(),
  hasNotification: z.boolean().nullable().optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutUserInput).optional(),
  notifications: z
    .lazy(() => NotificationCreateNestedManyWithoutUserInput)
    .optional(),
});
export const UserCreateOrConnectWithoutPostsInput = z.object({
  where: z.lazy(() => UserWhereUniqueInput),
  create: z.union([
    z.object({}).and(z.lazy(() => UserUncheckedCreateWithoutPostsInput)),
    z.object({}).and(z.lazy(() => UserCreateWithoutPostsInput)),
  ]),
});
export const UserCreateNestedOneWithoutPostsInput = z.object({
  create: z
    .union([
      z.object({}).and(z.lazy(() => UserUncheckedCreateWithoutPostsInput)),
      z.object({}).and(z.lazy(() => UserCreateWithoutPostsInput)),
    ])
    .optional(),
  connectOrCreate: z
    .lazy(() => UserCreateOrConnectWithoutPostsInput)
    .optional(),
  connect: z.lazy(() => UserWhereUniqueInput).optional(),
});
export const PostCreateWithoutCommentsInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  likedIds: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.lazy(() => PostCreatelikedIdsInput),
    ])
    .optional(),
  image: z.string().nullable().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutPostsInput),
});
export const PostCreateOrConnectWithoutCommentsInput = z.object({
  where: z.lazy(() => PostWhereUniqueInput),
  create: z.union([
    z
      .object({ user: z.undefined() })
      .and(z.lazy(() => PostUncheckedCreateWithoutCommentsInput)),
    z
      .object({ userId: z.undefined() })
      .and(z.lazy(() => PostCreateWithoutCommentsInput)),
  ]),
});
export const PostCreateNestedOneWithoutCommentsInput = z.object({
  create: z
    .union([
      z
        .object({ user: z.undefined() })
        .and(z.lazy(() => PostUncheckedCreateWithoutCommentsInput)),
      z
        .object({ userId: z.undefined() })
        .and(z.lazy(() => PostCreateWithoutCommentsInput)),
    ])
    .optional(),
  connectOrCreate: z
    .lazy(() => PostCreateOrConnectWithoutCommentsInput)
    .optional(),
  connect: z.lazy(() => PostWhereUniqueInput).optional(),
});
export const CommentCreateWithoutUserInput = z.object({
  id: z.string().optional(),
  body: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  post: z.lazy(() => PostCreateNestedOneWithoutCommentsInput),
});
export const CommentUncheckedCreateNestedManyWithoutUserInput = z.object({
  create: z
    .union([
      z
        .object({ post: z.undefined() })
        .and(z.lazy(() => CommentUncheckedCreateWithoutUserInput)),
      z
        .object({ postId: z.undefined() })
        .and(z.lazy(() => CommentCreateWithoutUserInput)),
      z
        .object({
          id: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          body: z.undefined(),
          post: z.undefined(),
        })
        .and(z.array(z.lazy(() => CommentUncheckedCreateWithoutUserInput))),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => CommentCreateWithoutUserInput)),
      z
        .record(z.number(), z.undefined())
        .and(z.lazy(() => CommentUncheckedCreateWithoutUserInput)),
      z
        .object({
          id: z.undefined(),
          createdAt: z.undefined(),
          updatedAt: z.undefined(),
          body: z.undefined(),
          postId: z.undefined(),
        })
        .and(z.array(z.lazy(() => CommentCreateWithoutUserInput))),
      z
        .object({})
        .and(z.array(z.lazy(() => CommentUncheckedCreateWithoutUserInput))),
      z.object({}).and(z.array(z.lazy(() => CommentCreateWithoutUserInput))),
    ])
    .optional(),
  connectOrCreate: z
    .union([
      z.lazy(() => CommentCreateOrConnectWithoutUserInput),
      z.array(z.lazy(() => CommentCreateOrConnectWithoutUserInput)),
    ])
    .optional(),
  createMany: z.lazy(() => CommentCreateManyUserInputEnvelope).optional(),
  connect: z
    .union([
      z.lazy(() => CommentWhereUniqueInput),
      z.array(z.lazy(() => CommentWhereUniqueInput)),
    ])
    .optional(),
});
export const UserUncheckedCreateInput = z.object({
  id: z.string().optional(),
  name: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  emailVerified: z.union([z.string(), z.date()]).nullable().optional(),
  image: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
  hashedPassword: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  followingIds: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.lazy(() => UserCreatefollowingIdsInput),
    ])
    .optional(),
  hasNotification: z.boolean().nullable().optional(),
  posts: z.lazy(() => PostUncheckedCreateNestedManyWithoutUserInput).optional(),
  comments: z
    .lazy(() => CommentUncheckedCreateNestedManyWithoutUserInput)
    .optional(),
  notifications: z
    .lazy(() => NotificationUncheckedCreateNestedManyWithoutUserInput)
    .optional(),
});
export const UserCreateInput = z.object({
  id: z.string().optional(),
  name: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  emailVerified: z.union([z.string(), z.date()]).nullable().optional(),
  image: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
  hashedPassword: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  followingIds: z
    .union([
      z.union([z.string(), z.array(z.string())]),
      z.lazy(() => UserCreatefollowingIdsInput),
    ])
    .optional(),
  hasNotification: z.boolean().nullable().optional(),
  posts: z.lazy(() => PostCreateNestedManyWithoutUserInput).optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutUserInput).optional(),
  notifications: z
    .lazy(() => NotificationCreateNestedManyWithoutUserInput)
    .optional(),
});
const UserCreateArgs = z.object({
  select: z
    .lazy(() => UserSelect)
    .nullable()
    .optional(),
  include: z
    .lazy(() => UserInclude)
    .nullable()
    .optional(),
  data: z.union([
    z.object({}).and(z.lazy(() => UserUncheckedCreateInput)),
    z.object({}).and(z.lazy(() => UserCreateInput)),
  ]),
});
