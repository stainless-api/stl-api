import { User, UserSelection } from "../users/models";
import { PostSchema, PostSelectionSchema } from "../posts/models";
import { z } from "stainless";
import prisma from "../../libs/prismadb";

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
    user?: z.IncludableZodType<typeof User>;
    user_fields?: z.SelectableZodType<typeof User>;
    post?: z.IncludableZodType<typeof PostSchema>;
    post_fields?: z.SelectableZodType<typeof PostSchema>;
  }
>;

const Comment1: Comment1 = Comment0.extend({
  user: z.lazy(() => User).includable(),
  user_fields: z.lazy(() => UserSelection).selectable(),
  post: z.lazy(() => PostSchema).includable(),
  post_fields: z.lazy(() => PostSelectionSchema).selectable(),
});

export const Comment = Comment1.prismaModel(prisma.comment);

export const CommentSelection = Comment.selection();
