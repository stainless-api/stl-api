import { User, UserSelection } from "../users/models";
import { Post, PostSelection } from "../posts/models";
import { z } from "stainless";
import prisma from "~/libs/prismadb";

const Comment0 = z.response({
  id: z.string().uuid(),

  body: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),

  userId: z.string().uuid(),
  postId: z.string().uuid(),
});

type Comment1 = z.CircularModel<
  typeof Comment0,
  {
    user?: z.ExpandableZodType<typeof User>;
    user_fields?: z.SelectableZodType<typeof User>;
    post?: z.ExpandableZodType<typeof Post>;
    post_fields?: z.SelectableZodType<typeof Post>;
  }
>;

const Comment1: Comment1 = Comment0.extend({
  user: z.lazy(() => User).expandable(),
  user_fields: z.lazy(() => UserSelection).selectable("user"),
  post: z.lazy(() => Post).expandable(),
  post_fields: z.lazy(() => PostSelection).selectable("post"),
});

export const Comment = Comment1.prismaModel(prisma.comment);

export const CommentSelection = Comment.selection();
