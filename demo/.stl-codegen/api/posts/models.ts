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
    user: z.lazy(() => models.IncludableUserSchema).optional(),
    user_fields: z.lazy(() => models.SelectableUserSchema).optional(),
    comments: z.lazy(() => models.IncludableCommentsSchema).optional(),
    comments_fields: z
      .lazy(() => models.IncludableCommentsFieldSchema)
      .optional(),
  })
  .prismaModel(() => new models.PostType().model);
export const PostLoader: z.ZodTypeAny = z
  .string()
  .prismaModelLoader(() => new models.PostLoader().model);
