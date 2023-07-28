import { stl } from "../../libs/stl";
import { Notification, NotificationSelection } from "../notifications";
import { Post, PostSelection } from "../posts/index";
import { Comment, CommentSelection } from "../comments/index";
import { NotFoundError, z } from "stainless";
import prisma from "../../libs/prismadb";

const User0 = z.response({
  id: z.string().uuid(),

  name: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  emailVerified: z.date().nullable().optional(),
  image: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),

  hashedPassword: z.string().nullable().optional(),

  createdAt: z.date(),
  updatedAt: z.date(),

  followingIds: z.array(z.string().uuid()),
  hasNotification: z.boolean().nullable().optional(),
  followersCount: z.number().optional(),
});

type User1 = z.CircularModel<
  typeof User0,
  {
    posts?: z.IncludableZodType<z.ZodArray<typeof Post>>;
    posts_fields?: z.SelectableZodType<z.ZodArray<typeof Post>>;
    comments?: z.IncludableZodType<z.ZodArray<typeof Comment>>;
    comments_fields?: z.SelectableZodType<z.ZodArray<typeof Comment>>;
    notifications?: z.IncludableZodType<z.ZodArray<typeof Notification>>;
    notifications_fields?: z.SelectableZodType<z.ZodArray<typeof Notification>>;
  }
>;
const User1: User1 = User0.extend({
  posts: z.array(z.lazy(() => Post)).includable(),
  posts_fields: z.array(z.lazy(() => PostSelection)).selectable(),
  comments: z.array(z.lazy(() => Comment)).includable(),
  comments_fields: z.array(z.lazy(() => CommentSelection)).selectable(),
  notifications: z.array(z.lazy(() => Notification)).includable(),
  notifications_fields: z
    .array(z.lazy(() => NotificationSelection))
    .selectable(),
});
export const User = User1.prismaModel(prisma.user);

export const UserSelection = User.selection();

export const list = stl.endpoint({
  endpoint: "GET /api/users",
  response: z.pageResponse(User),

  query: z.PaginationParams.extend({
    sortBy: z.enum(["createdAt"]).default("createdAt"),
    sortDirection: z.enum(["desc"]).default("desc"),
  }),
  async handler(params, ctx) {
    return await ctx.prisma.paginate({});
  },
});

export const retrieve = stl.endpoint({
  endpoint: "GET /api/users/{userId}",
  response: User,

  path: z.path({
    userId: z.string(),
  }),
  async handler({ userId }, ctx) {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) throw new NotFoundError();

    const followersCount = await prisma.user.count({
      where: {
        followingIds: {
          has: userId,
        },
      },
    });

    return { ...existingUser, followersCount };
  },
});

export const users = stl.resource({
  summary: "Users",
  internal: false,
  models: {
    User,
    UserSelection,
    Notification,
    NotificationSelection,
  },
  actions: {
    list,
    retrieve,
  },
});
