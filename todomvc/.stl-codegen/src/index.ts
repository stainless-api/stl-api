import { z } from "stainless";
import * as Index from "../../src/index";
export const ItemLoader: z.ZodTypeAny = z
  .string()
  .uuid()
  .stlTransform(new Index.ItemLoader().transform);
export const RetrievePathParams: z.ZodTypeAny = z.object({
  item: z.lazy(() => ItemLoader),
});
export const Item: z.ZodTypeAny = z.object({
  completed: z.boolean(),
  description: z.string(),
  id: z.string().uuid(),
});
export const GET__items_$58item: any = {
  path: z.lazy(() => RetrievePathParams),
  response: z.lazy(() => Item),
};
export const CreateItemBody: z.ZodTypeAny = z.object({
  completed: z.boolean(),
  description: z.string(),
});
export const POST__items: any = {
  body: z.lazy(() => CreateItemBody),
  response: z.void(),
};
