import { z } from "stainless";
import {
  IncludableUserSchema,
  SelectableUserSchema,
  IncludableCommentsSchema,
  IncludableCommentsFieldSchema,
  PostType as __class_PostType,
  PostLoader as __class_PostLoader,
} from "../../../api/posts/models";
export const PostType: z.ZodTypeAny = z
  .object({
    id: z.string().uuid(),
    body: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    userId: z.string().uuid(),
    likedIds: z.array(z.string().uuid()),
    image: z.string().nullable().optional(),
    user: z.lazy(() => IncludableUserSchema).optional(),
    user_fields: z.lazy(() => SelectableUserSchema).optional(),
    comments: z.lazy(() => IncludableCommentsSchema).optional(),
    comments_fields: z.lazy(() => IncludableCommentsFieldSchema).optional(),
  })
  .prismaModel(new __class_PostType().model);
export const PostLoader: z.ZodTypeAny = z
  .string()
  .prismaModelLoader(new __class_PostLoader().model);
