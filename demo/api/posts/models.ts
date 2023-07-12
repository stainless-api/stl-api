import { User } from "../users/models";
import { Comment, CommentSelection } from "../comments/models";
import prisma from "../../libs/prismadb";
import { stl } from "../../libs/stl";
import { z, t } from "stainless";
type Uuid = t.StringSchema<{ uuid: true }>;
import { Post as __symbol_Post } from "@stl-api/gen/api/posts/models";
export const IncludableUserSchema = User.includable();
export const SelectableUserSchema = User.selectable();
export const CommentsSchema = z.array(z.lazy(() => Comment)).includable();
export const CommentsFieldSchema = z.array(z.lazy(() => Comment)).selectable();

export type Post = {
  id: Uuid;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  userId: Uuid;
  likedIds: Uuid[];
  image?: string | null;
  // dummy_includable?: t.Includable<{}>,
  // dummy_selectable_fields?: t.Selectable<{}>,
  user?: typeof IncludableUserSchema;
  user_fields?: typeof SelectableUserSchema;
  comments?: typeof CommentsSchema;
  comments_field?: typeof CommentsFieldSchema;
};

export const PostSchema = stl.magic<Post>(__symbol_Post).prismaModel(prisma.post);

export const PostSelectionSchema = PostSchema.selection();

export const PostPageSchema = z.pageResponse(PostSchema);
