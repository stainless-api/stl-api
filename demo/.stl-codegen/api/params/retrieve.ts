import { z } from "stainless";
export const QueryParams: z.ZodTypeAny = z.object({
  boolean: z.boolean().optional(),
  number: z.number().optional(),
  string: z.string().optional(),
  date: z.date().optional(),
});
export const PathParams: z.ZodTypeAny = z.object({ id: z.number() });
export const Response: z.ZodTypeAny = z
  .lazy(() => PathParams)
  .and(z.lazy(() => QueryParams));
export const GET__api_params_$id$: any = {
  query: z.lazy(() => QueryParams),
  path: z.lazy(() => PathParams),
  response: z.lazy(() => Response),
};
