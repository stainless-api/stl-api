import { stl } from "../../libs/stl";

import { User, UserSelection } from "../users/index";
import { Comment, CommentSelection } from "../comments/index";
import prisma from "../../libs/prismadb";
import { z } from "stainless";
import { PrismaModel, PrismaModelLoader } from "@stl-api/prisma";
import { Post as RawPrismaPost } from "@prisma/client";
import { PostResponse as PostResponseSchema } from "../../.stl-codegen/api/posts/index";

export const IncludableUserSchema = z.lazy(() => User).includable();
export const SelectableUserSchema = z.lazy(() => UserSelection).selectable();
export const IncludableCommentsSchema = z
  .array(z.lazy(() => Comment))
  .includable();
export const IncludableCommentsFieldSchema = z
  .array(z.lazy(() => CommentSelection))
  .selectable();

type PostProps = {
  id: z.UUID;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  userId: z.UUID;
  likedIds: z.UUID[];
  image?: string | null;
  user: z.ZodSchema<{ schema: typeof IncludableUserSchema }>;
  user_fields: z.ZodSchema<{ schema: typeof SelectableUserSchema }>;
  comments: z.ZodSchema<{ schema: typeof IncludableCommentsSchema }>;
  comments_fields: z.ZodSchema<{
    schema: typeof IncludableCommentsFieldSchema;
  }>;
};

export class PostResponse extends PrismaModel<PostProps> {
  model = prisma.post;
}

export class PostIdLoader extends PrismaModelLoader<RawPrismaPost, string> {
  model = prisma.post;
}

export const Post = stl.codegenSchema<PostResponse>(PostResponseSchema);
type PostOut = z.output<typeof Post>;

export const PostSelection = Post.selection();

export const PostPage = z.pageResponse(Post);

export const list = stl.endpoint({
  endpoint: "GET /api/posts",
  response: PostPage,

  query: z.PaginationParams.extend({
    sortBy: z.enum(["id"]).default("id"),
    userId: z.string().optional(),
    include: z.includes(PostPage).optional(),
    select: z.selects(PostPage).optional(),
  }),
  async handler({ userId, include, ...params }, ctx) {
    if (userId && typeof userId === "string") {
      const page = await ctx.prisma.paginate({
        where: { userId },
      });
      return page;
    } else {
      const results = await ctx.prisma.findMany({});
      return stl.plugins.prisma.pagination.makeResponse(params, results);
    }
  },
});

type CreateQueryParams = {
  include?: z.Includes<PostResponse, 3>;
};

type CreateBody = {
  body: string;
};

export const create = stl
  .types<{
    query: CreateQueryParams;
    body: CreateBody;
    response: PostResponse;
  }>()
  .endpoint({
    endpoint: "POST /api/posts",
    config: {
      authenticated: true,
    },
    async handler({ body }, ctx) {
      return await ctx.prisma.create({
        data: {
          userId: ctx.requireCurrentUser().id,
          body,
        },
      });
    },
  });

type RetrievePathParams = {
  post: PostIdLoader;
};

type RetrieveQueryParams = {
  include?: z.Includes<PostResponse, 3>;
  select?: z.Selects<PostResponse, 3>;
};

export const retrieve = stl
  .types<{
    response: PostResponse;
    path: RetrievePathParams;
    query: RetrieveQueryParams;
  }>()
  .endpoint({
    endpoint: "GET /api/posts/{post}",

    async handler({ post }, ctx) {
      return post;
    },
  });

export const posts = stl.resource({
  summary: "Posts; the tweets of this twitter clone",
  internal: false,
  models: {
    Post,
    PostPage,
    PostSelection,
  },
  actions: {
    create,
    list,
    retrieve,
  },
});
