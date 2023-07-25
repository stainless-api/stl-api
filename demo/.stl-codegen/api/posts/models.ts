import { z } from "stainless";
import * as models from "../../../api/posts/models";
export const PostType: z.ZodTypeAny = z
  .object({
    id: z.string().uuid(),
    body: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    userId: z.string().uuid(),
    likedIds: z.array(z.string().uuid()),
    image: z.string().nullable().optional(),
    user: z.lazy(() => models.IncludableUserSchema),
    user_fields: z.lazy(() => models.SelectableUserSchema),
    comments: z.lazy(() => models.IncludableCommentsSchema),
    comments_fields: z.lazy(() => models.IncludableCommentsFieldSchema),
  })
  .prismaModel(() => new models.PostType().model);
export const PostLoader: z.ZodTypeAny = z
  .string()
  .prismaModelLoader(() => new models.PostLoader().model);
