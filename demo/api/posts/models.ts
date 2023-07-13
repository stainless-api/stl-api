import { User, UserSelection } from "../users/models";
import { Comment, CommentSelection } from "../comments/models";
import prisma from "../../libs/prismadb";
import { stl } from "../../libs/stl";
import { z, t } from "stainless";
type Uuid = t.StringSchema<{ uuid: true }>;
import { PostType as __symbol_PostType } from "../../stl-api-gen/api/posts/models";
import { PrismaModel } from "@stl-api/prisma";
import { IncludablePaths } from "stainless/src/includes";
import { Includable } from "stainless/src/t";
export const IncludableUserSchema = z.lazy(() => User).includable();
export const SelectableUserSchema = z.lazy(() => User).selectable();
export const CommentsSchema = z.array(z.lazy(() => Comment)).includable();
export const CommentsFieldSchema = z.array(z.lazy(() => Comment)).selectable();

export type PostType = PrismaModel<
  {
    id: Uuid;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    userId: Uuid;
    likedIds: Uuid[];
    image?: string | null;
    user: typeof IncludableUserSchema;
    user_fields: typeof SelectableUserSchema;
    comments: typeof CommentsSchema;
    comments_field: typeof CommentsFieldSchema;
  },
  typeof prisma.post
>;

export const Post = stl.magic<PostType>(__symbol_PostType);

export const PostSelection = Post.selection();

export const PostPage = z.pageResponse(Post);

type X = t.toZod<undefined | typeof IncludableUserSchema>;
