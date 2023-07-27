import { z } from "stainless";
import * as Models from "../../../api/posts/models";
const PostProps: z.ZodTypeAny = z.object({
  id: z.string().uuid(),
  body: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  likedIds: z.array(z.string().uuid()),
  image: z.string().nullable().optional(),
  user: z.lazy(() => Models.IncludableUserSchema),
  user_fields: z.lazy(() => Models.SelectableUserSchema),
  comments: z.lazy(() => Models.IncludableCommentsSchema),
  comments_fields: z.lazy(() => Models.IncludableCommentsFieldSchema),
});
export const PostResponse: z.ZodTypeAny = z
  .lazy(() => PostProps)
  .prismaModel(() => new Models.PostResponse().model);
export const PostIdLoader: z.ZodTypeAny = z
  .string()
  .prismaModelLoader(() => new Models.PostIdLoader().model);
