import z from "zod";

import { Address } from "./common";

export const Order = z.object({
  item: z.string(),
  billingAddress: z.lazy(() => Address),
  shippingAddress: z.lazy(() => Address),
});
