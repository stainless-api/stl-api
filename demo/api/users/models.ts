import z from "zod";
import { Post, PostSelection } from "../posts/models";
import { Comment, CommentSelection } from "../comments/models";
import { Notification, NotificationSelection } from "../notifications/models";
import { Expandable, Selectable } from "@stl-api/stl";

const baseUser = z.object({
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

export type User = z.infer<typeof baseUser> & {
  posts?: Expandable<Post[]>;
  posts_fields?: Selectable<PostSelection[]>;
  comments?: Expandable<Comment[]>;
  comments_fields?: Selectable<CommentSelection[]>;
  notifications?: Expandable<Notification[]>;
  notifications_fields?: Selectable<NotificationSelection[]>;
};

export const User: z.ZodType<User> = baseUser.extend({
  posts: z.array(z.lazy(() => Post)).expandable(),
  posts_fields: z.array(z.lazy(() => PostSelection)).selectable(),
  comments: z.array(z.lazy(() => Comment)).expandable(),
  comments_fields: z.array(z.lazy(() => CommentSelection)).selectable(),
  notifications: z.array(z.lazy(() => Notification)).expandable(),
  notifications_fields: z
    .array(z.lazy(() => NotificationSelection))
    .selectable(),
});

export const UserSelection = User.selection();
export type UserSelection = z.infer<typeof UserSelection>;
