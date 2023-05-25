import { User, UserOutput, UserInput, UserSelection } from "../users/models";
import {
  Comment,
  CommentOutput,
  CommentInput,
  CommentSelection,
} from "../comments/models";
import prisma from "~/libs/prismadb";
import { z } from "stainless";

const Post0 = z.response({
  id: z.string().uuid(),
  body: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  likedIds: z.array(z.string().uuid()),
  image: z.string().nullable().optional(),
});

export type PostOutput = z.output<typeof Post0> & {
  user?: z.ExpandableOutput<UserOutput>;
  user_fields?: z.SelectableOutput<UserOutput>;
  comments?: z.ExpandableOutput<CommentOutput[]>;
  comments_fields?: z.SelectableOutput<CommentOutput[]>;
};
export type PostInput = z.input<typeof Post0> & {
  user?: z.ExpandableInput<UserInput>;
  user_fields?: z.SelectableInput<UserInput>;
  comments?: z.ExpandableInput<CommentInput[]>;
  comments_fields?: z.SelectableInput<CommentInput[]>;
};

const Post1: z.ZodType<PostOutput, z.ZodObjectDef, PostInput> = Post0.extend({
  user: z.lazy(() => User).expandable(),
  user_fields: z.lazy(() => UserSelection).selectable(),
  comments: z.array(z.lazy(() => Comment)).expandable(),
  comments_fields: z.array(z.lazy(() => CommentSelection)).selectable(),
});

export const Post = Post1.prismaModel(prisma.post);

export const PostSelection = Post.selection();

export const PostPage = z.pageResponse(Post);
