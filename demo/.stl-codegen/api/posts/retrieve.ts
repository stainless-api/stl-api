import { z } from "stainless";
import * as TD from "stainless/dist/t.d";
import * as Models from "./models";
export const QueryParams: z.ZodTypeAny = z.object({
  include: z.string().optional(),
  select: z.string().optional(),
});
export const PathParams: z.ZodTypeAny = z.object({
  post: z.lazy(() => Models.PostIdLoader),
});
export const GET__api_posts_$post$: any = {
  query: z.lazy(() => QueryParams),
  path: z.lazy(() => PathParams),
  response: z.lazy(() => Models.PostResponse),
};
