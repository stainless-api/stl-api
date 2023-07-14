import { z } from "stainless";
import {
  IncludableUserSchema,
  SelectableUserSchema,
  IncludableCommentsSchema,
  IncludableCommentsFieldSchema,
} from "../../../api/posts/models";
import { prisma } from "../../../libs/prismadb";
export const PostType: z.ZodTypeAny = z
  .object({
    id: z.string().uuid(),
    body: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    userId: z.string().uuid(),
    likedIds: z.array(z.string().uuid()),
    image: z.string().nullable().optional(),
    user: z.lazy(() => IncludableUserSchema),
    user_fields: z.lazy(() => SelectableUserSchema),
    comments: z.lazy(() => IncludableCommentsSchema),
    comments_field: z.lazy(() => IncludableCommentsFieldSchema),
  })
  .prismaModel(prisma.post);
