import z from "zod";

const Address = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
});

export const Contact = z.object({
  firstName: z.string(),
  lastName: z.string(),
  address: z.lazy(() => Address),
});
