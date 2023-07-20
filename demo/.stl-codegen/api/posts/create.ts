import { z } from "stainless";
import { PostType as __class_PostType } from "./models";
export const Query: z.ZodTypeAny = z.object({
  include: z
    .includes(
      z.lazy(() => __class_PostType),
      3
    )
    .optional(),
});
export const Body: z.ZodTypeAny = z.object({ body: z.string() });
export const post__api_posts: any = {
  query: z.lazy(() => Query),
  body: z.lazy(() => Body),
  response: z.lazy(() => __class_PostType),
};
