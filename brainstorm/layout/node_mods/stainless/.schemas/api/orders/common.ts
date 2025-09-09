import z from "zod";

export const Address = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
});
