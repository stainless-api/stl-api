import { User, UserSelection } from "../users/models";
import { Comment, CommentSelection } from "../comments/models";
import prisma from "../../libs/prismadb";
import { stl } from "../../libs/stl";
import { z, t } from "stainless";
type Uuid = t.StringSchema<{ uuid: true }>;
import { PrismaModel, PrismaModelLoader } from "@stl-api/prisma";
import { PostType as __symbol_PostType } from "../../.stl-codegen/api/posts/models";
export const IncludableUserSchema = z.lazy(() => User).includable();
export const SelectableUserSchema = z.lazy(() => UserSelection).selectable();
export const IncludableCommentsSchema = z
  .array(z.lazy(() => Comment))
  .includable();
export const IncludableCommentsFieldSchema = z
  .array(z.lazy(() => CommentSelection))
  .selectable();

export class PostType extends PrismaModel {
  declare input: {
    id: Uuid;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    userId: Uuid;
    likedIds: Uuid[];
    image?: string | null;
    user?: typeof IncludableUserSchema;
    user_fields?: typeof SelectableUserSchema;
    comments?: typeof IncludableCommentsSchema;
    comments_fields?: typeof IncludableCommentsFieldSchema;
  };
  model = prisma.post;
}

export class PostLoader extends PrismaModelLoader {
  declare input: string;
  model = prisma.post;
}

export const Post = stl.magic<PostType>(__symbol_PostType);

export const PostSelection = Post.selection();

export const PostPage = z.pageResponse(Post);
