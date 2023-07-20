import { z } from "stainless";
import {
  PostType as __class_PostType,
  PostLoader as __class_PostLoader,
} from "./models";
export const Query: z.ZodTypeAny = z.object({
  include: z
    .includes(
      z.lazy(() => __class_PostType),
      3
    )
    .optional(),
  select: z
    .selects(
      z.lazy(() => __class_PostType),
      3
    )
    .optional(),
});
export const Path: z.ZodTypeAny = z.object({
  post: z.lazy(() => __class_PostLoader),
});
export const get__api_posts_$post$: any = {
  query: z.lazy(() => Query),
  path: z.lazy(() => Path),
  response: z.lazy(() => __class_PostType),
};
