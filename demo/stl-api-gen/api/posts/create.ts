import { z } from "stainless";
import { PostType as __symbol_PostType } from "./models";
import * as __u46u46$modelsu46ts from "../../../api/posts/models";
import * as __u46u46$u46u46$u46u46$libs$prismadbu46ts from "../../../libs/prismadb";
export const Query: z.ZodTypeAny = z.object({
  include: z
    .includes(
      z.lazy(() => __symbol_PostType),
      3
    )
    .optional(),
});
export const Body: z.ZodTypeAny = z.object({ body: z.string() });
export const __postu32$api$posts: any = {
  query: z.lazy(() => Query),
  body: z.lazy(() => Body),
  response: z
    .object({
      id: z.string().uuid(),
      body: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      userId: z.string().uuid(),
      likedIds: z.array(z.string().uuid()),
      image: z.string().nullable().optional(),
      user: z.lazy(() => __u46u46$modelsu46ts.IncludableUserSchema),
      user_fields: z.lazy(() => __u46u46$modelsu46ts.SelectableUserSchema),
      comments: z.lazy(() => __u46u46$modelsu46ts.IncludableCommentsSchema),
      comments_field: z.lazy(
        () => __u46u46$modelsu46ts.IncludableCommentsFieldSchema
      ),
    })
    .prismaModel(__u46u46$u46u46$u46u46$libs$prismadbu46ts.prisma.post),
};
