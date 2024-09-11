import { z } from "stainless";
import * as Models from "./models";
export const QueryParams: z.ZodTypeAny = z.object({
  include: z
    .includes(
      z.lazy(() => Models.PostResponse),
      3
    )
    .optional(),
  select: z
    .selects(
      z.lazy(() => Models.PostResponse),
      3
    )
    .optional(),
});
export const PathParams: z.ZodTypeAny = z.object({
  post: z.lazy(() => Models.PostIdLoader),
});
export const GET__api_posts_$post$: any = {
  query: z.lazy(() => QueryParams),
  path: z.lazy(() => PathParams),
  response: z.lazy(() => Models.PostResponse),
};
