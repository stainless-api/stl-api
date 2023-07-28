import { z } from "stainless";
import * as Index from "../../../api/posts/index";
const PostProps: z.ZodTypeAny = z.object({
  id: z.string().uuid(),
  body: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  likedIds: z.array(z.string().uuid()),
  image: z.string().nullable().optional(),
  user: z.lazy(() => Index.IncludableUserSchema),
  user_fields: z.lazy(() => Index.SelectableUserSchema),
  comments: z.lazy(() => Index.IncludableCommentsSchema),
  comments_fields: z.lazy(() => Index.IncludableCommentsFieldSchema),
});
export const PostResponse: z.ZodTypeAny = z
  .lazy(() => PostProps)
  .prismaModel(() => new Index.PostResponse().model);
export const CreateQueryParams: z.ZodTypeAny = z.object({
  include: z
    .includes(
      z.lazy(() => PostResponse),
      3
    )
    .optional(),
});
export const CreateBody: z.ZodTypeAny = z.object({ body: z.string() });
export const POST__api_posts: any = {
  query: z.lazy(() => CreateQueryParams),
  body: z.lazy(() => CreateBody),
  response: z.lazy(() => PostResponse),
};
export const RetrieveQueryParams: z.ZodTypeAny = z.object({
  include: z
    .includes(
      z.lazy(() => PostResponse),
      3
    )
    .optional(),
  select: z
    .selects(
      z.lazy(() => PostResponse),
      3
    )
    .optional(),
});
export const PostIdLoader: z.ZodTypeAny = z
  .string()
  .prismaModelLoader(() => new Index.PostIdLoader().model);
export const RetrievePathParams: z.ZodTypeAny = z.object({
  post: z.lazy(() => PostIdLoader),
});
export const GET__api_posts_$post$: any = {
  query: z.lazy(() => RetrieveQueryParams),
  path: z.lazy(() => RetrievePathParams),
  response: z.lazy(() => PostResponse),
};
