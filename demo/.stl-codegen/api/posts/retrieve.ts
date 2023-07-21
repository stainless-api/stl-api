import { z } from "stainless";
import * as models from "./models";
export const Query: z.ZodTypeAny = z.object({
  include: z
    .includes(
      z.lazy(() => models.PostType),
      3
    )
    .optional(),
  select: z
    .selects(
      z.lazy(() => models.PostType),
      3
    )
    .optional(),
});
export const Path: z.ZodTypeAny = z.object({
  post: z.lazy(() => models.PostLoader),
});
export const get__api_posts_$post$: any = {
  query: z.lazy(() => Query),
  path: z.lazy(() => Path),
  response: z.lazy(() => models.PostType),
};
