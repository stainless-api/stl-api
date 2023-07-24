import { z } from "stainless";
import * as models from "./models";
export const Query: z.ZodTypeAny = z.object({
  include: z
    .includes(
      z.lazy(() => models.PostType),
      3
    )
    .optional(),
});
export const Body: z.ZodTypeAny = z.object({ body: z.string() });
export const post__api_posts: any = {
  query: z.lazy(() => Query),
  body: z.lazy(() => Body),
  response: z.lazy(() => models.PostType),
};
