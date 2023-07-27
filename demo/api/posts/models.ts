import { User, UserSelection } from "../users/models";
import { Comment, CommentSelection } from "../comments/models";
import prisma from "../../libs/prismadb";
import { stl } from "../../libs/stl";
import { z, t } from "stainless";
import { PrismaModel, PrismaModelLoader } from "@stl-api/prisma";
import { PostResponse as PostResponseSchema } from "../../.stl-codegen/api/posts/models";

type Uuid = t.StringSchema<{ uuid: true }>;
export const IncludableUserSchema = z.lazy(() => User).includable();
export const SelectableUserSchema = z.lazy(() => UserSelection).selectable();
export const IncludableCommentsSchema = z
  .array(z.lazy(() => Comment))
  .includable();
export const IncludableCommentsFieldSchema = z
  .array(z.lazy(() => CommentSelection))
  .selectable();

export class PostResponse extends PrismaModel {
  declare input: {
    id: Uuid;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    userId: Uuid;
    likedIds: Uuid[];
    image?: string | null;
    user: t.ZodSchema<{ schema: typeof IncludableUserSchema }>;
    user_fields: t.ZodSchema<{ schema: typeof SelectableUserSchema }>;
    comments: t.ZodSchema<{ schema: typeof IncludableCommentsSchema }>;
    comments_fields: t.ZodSchema<{
      schema: typeof IncludableCommentsFieldSchema;
    }>;
  };
  model = prisma.post;
}

export class PostIdLoader extends PrismaModelLoader {
  declare input: string;
  model = prisma.post;
}

export const Post = stl.codegenSchema<PostResponse>(PostResponseSchema);

export const PostSelection = Post.selection();

export const PostPage = z.pageResponse(Post);
