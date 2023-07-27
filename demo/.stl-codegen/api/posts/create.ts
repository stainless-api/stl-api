import { z } from "stainless";
import * as TD from "stainless/dist/t.d";
import * as Models from "./models";
export const QueryParams: z.ZodTypeAny = z.object({
  include: z.string().optional(),
});
export const Body: z.ZodTypeAny = z.object({ body: z.string() });
export const POST__api_posts: any = {
  query: z.lazy(() => QueryParams),
  body: z.lazy(() => Body),
  response: z.lazy(() => Models.PostResponse),
};
