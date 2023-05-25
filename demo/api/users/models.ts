import { Post, PostOutput, PostInput, PostSelection } from "../posts/models";
import {
  Comment,
  CommentOutput,
  CommentInput,
  CommentSelection,
} from "../comments/models";
import {
  Notification,
  NotificationOutput,
  NotificationInput,
  NotificationSelection,
} from "../notifications/models";
import { z } from "stainless";
import prisma from "~/libs/prismadb";

const baseUser = z.response({
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

export type UserOutput = z.output<typeof baseUser> & {
  posts?: z.ExpandableOutput<PostOutput[]>;
  posts_fields?: z.SelectableOutput<PostOutput[]>;
  comments?: z.ExpandableOutput<CommentOutput[]>;
  comments_fields?: z.SelectableOutput<CommentOutput[]>;
  notifications?: z.ExpandableOutput<NotificationOutput[]>;
  notifications_fields?: z.SelectableOutput<NotificationOutput[]>;
};
export type UserInput = z.input<typeof baseUser> & {
  posts?: z.ExpandableInput<PostInput[]>;
  posts_fields?: z.SelectableInput<PostInput[]>;
  comments?: z.ExpandableInput<CommentInput[]>;
  comments_fields?: z.SelectableInput<CommentInput[]>;
  notifications?: z.ExpandableInput<NotificationInput[]>;
  notifications_fields?: z.SelectableInput<NotificationInput[]>;
};

export const User: z.ZodType<UserOutput, z.ZodObjectDef, UserInput> = baseUser
  .extend({
    posts: z.array(z.lazy(() => Post)).expandable(),
    posts_fields: z.array(z.lazy(() => PostSelection)).selectable(),
    comments: z.array(z.lazy(() => Comment)).expandable(),
    comments_fields: z.array(z.lazy(() => CommentSelection)).selectable(),
    notifications: z.array(z.lazy(() => Notification)).expandable(),
    notifications_fields: z
      .array(z.lazy(() => NotificationSelection))
      .selectable(),
  })
  .prismaModel(prisma.user);

export const UserSelection = User.selection();
