import { Post, PostSelection } from "../posts/models";
import { Comment, CommentSelection } from "../comments/models";
import { Notification, NotificationSelection } from "../notifications/models";
import { z } from "stainless";
import prisma from "~/libs/prismadb";

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
    posts?: z.ExpandableZodType<z.ZodArray<typeof Post>>;
    posts_fields?: z.SelectableZodType<z.ZodArray<typeof Post>>;
    comments?: z.ExpandableZodType<z.ZodArray<typeof Comment>>;
    comments_fields?: z.SelectableZodType<z.ZodArray<typeof Comment>>;
    notifications?: z.ExpandableZodType<z.ZodArray<typeof Notification>>;
    notifications_fields?: z.SelectableZodType<z.ZodArray<typeof Notification>>;
  }
>;
const User1: User1 = User0.extend({
  posts: z.array(z.lazy(() => Post)).expandable(),
  posts_fields: z.array(z.lazy(() => PostSelection)).selectable("posts"),
  comments: z.array(z.lazy(() => Comment)).expandable(),
  comments_fields: z
    .array(z.lazy(() => CommentSelection))
    .selectable("comments"),
  notifications: z.array(z.lazy(() => Notification)).expandable(),
  notifications_fields: z
    .array(z.lazy(() => NotificationSelection))
    .selectable("notifications"),
});
export const User = User1.prismaModel(prisma.user);

export const UserSelection = User.selection();
