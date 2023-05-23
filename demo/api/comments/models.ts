import z from "zod";
import { User, UserSelection } from "../users/models";
import { Post, PostSelection } from "../posts/models";
import { Expandable, Selectable } from "stainless";

const baseComment = z.object({
  id: z.string().uuid(),

  body: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),

  userId: z.string().uuid(),
  postId: z.string().uuid(),
});

export type Comment = z.infer<typeof baseComment> & {
  user?: Expandable<User>;
  user_fields?: Selectable<UserSelection>;
  post?: Expandable<Post>;
  post_fields?: Selectable<PostSelection>;
};

export const Comment: z.ZodType<Comment> = baseComment.extend({
  user: z.lazy(() => User).expandable(),
  user_fields: z.lazy(() => UserSelection).selectable(),
  post: z.lazy(() => Post).expandable(),
  post_fields: z.lazy(() => PostSelection).selectable(),
});

export const CommentSelection = Comment.selection();
export type CommentSelection = z.infer<typeof CommentSelection>;
