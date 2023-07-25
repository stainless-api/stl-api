import { z } from "stainless";
import * as Models from "../../../api/posts/models";
export const PostType: z.ZodTypeAny = z
  .object({
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
  })
  .prismaModel(() => new Models.PostType().model);
export const PostLoader: z.ZodTypeAny = z
  .string()
  .prismaModelLoader(() => new Models.PostLoader().model);
