import { User, UserOutput, UserInput, UserSelection } from "../users/models";
import { Post, PostOutput, PostInput, PostSelection } from "../posts/models";
import { z } from "stainless";
import prisma from "~/libs/prismadb";

const baseComment = z.response({
  id: z.string().uuid(),

  body: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),

  userId: z.string().uuid(),
  postId: z.string().uuid(),
});

export type CommentOutput = z.output<typeof baseComment> & {
  user?: z.ExpandableOutput<UserOutput>;
  user_fields?: z.SelectableOutput<UserOutput>;
  post?: z.ExpandableOutput<PostOutput>;
  post_fields?: z.SelectableOutput<PostOutput>;
};
export type CommentInput = z.input<typeof baseComment> & {
  user?: z.ExpandableInput<UserInput>;
  user_fields?: z.SelectableInput<UserInput>;
  post?: z.ExpandableInput<PostInput>;
  post_fields?: z.SelectableInput<PostInput>;
};

export const Comment: z.ZodType<CommentOutput, z.ZodObjectDef, CommentInput> = baseComment
  .extend({
    user: z.lazy(() => User).expandable(),
    user_fields: z.lazy(() => UserSelection).selectable(),
    post: z.lazy(() => Post).expandable(),
    post_fields: z.lazy(() => PostSelection).selectable(),
  })
  .prismaModel(prisma.comment);

export const CommentSelection = Comment.selection();
