import z from "zod";
import { User, UserSelection } from "../users/models";
import { Comment, CommentSelection } from "../comments/models";
import prisma from "@/libs/prismadb";
import { stl } from "@/libs/stl";
import { Expandable, Selectable } from "@stl-api/stl";

const Post0 = z.object({
  id: z.string().uuid(),
  body: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  likedIds: z.array(z.string().uuid()),
  image: z.string().nullable().optional(),
});

export type Post1 = z.infer<typeof Post0> & {
  user?: Expandable<User>;
  user_fields?: Selectable<UserSelection>;
  comments?: Expandable<Comment[]>;
  comments_fields?: Selectable<CommentSelection[]>;
};

const Post1: z.ZodType<Post1> = Post0.extend({
  user: z.lazy(() => User).expandable(),
  user_fields: z.lazy(() => UserSelection).selectable(),
  comments: z.array(z.lazy(() => Comment)).expandable(),
  comments_fields: z.array(z.lazy(() => CommentSelection)).selectable(),
});

export const Post = stl.response(Post1, { prismaModel: prisma.post });
export type Post = z.output<typeof Post>;

export const PostSelection = Post.selection();
export type PostSelection = z.output<typeof PostSelection>;
