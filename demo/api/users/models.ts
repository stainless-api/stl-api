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
import {
  ExpandableOutput,
  ExpandableInput,
  SelectableOutput,
  SelectableInput,
  z,
} from "stainless";
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
  posts?: ExpandableOutput<PostOutput[]>;
  posts_fields?: SelectableOutput<PostOutput[]>;
  comments?: ExpandableOutput<CommentOutput[]>;
  comments_fields?: SelectableOutput<CommentOutput[]>;
  notifications?: ExpandableOutput<NotificationOutput[]>;
  notifications_fields?: SelectableOutput<NotificationOutput[]>;
};
export type UserInput = z.input<typeof baseUser> & {
  posts?: ExpandableInput<PostInput[]>;
  posts_fields?: SelectableInput<PostInput[]>;
  comments?: ExpandableInput<CommentInput[]>;
  comments_fields?: SelectableInput<CommentInput[]>;
  notifications?: ExpandableInput<NotificationInput[]>;
  notifications_fields?: SelectableInput<NotificationInput[]>;
};

export const User: z.ZodType<UserOutput, any, UserInput> = baseUser
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
