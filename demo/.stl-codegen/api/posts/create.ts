import { z } from "stainless";
import * as Models from "./models";
export const Query: z.ZodTypeAny = z.object({
  include: z
    .includes(
      z.lazy(() => Models.PostType),
      3
    )
    .optional(),
});
export const Body: z.ZodTypeAny = z.object({ body: z.string() });
export const POST__api_posts: any = {
  query: z.lazy(() => Query),
  body: z.lazy(() => Body),
  response: z.lazy(() => Models.PostType),
};
