import { Address } from "./common";
import { genMultipleFiles } from "./genMultipleFiles";

type T = {
  firstName: string;
  lastName: string;
  address?: Address;
};

it(`imported type`, () =>
  expect(genMultipleFiles({ __filename })).toMatchInlineSnapshot(`
{
  "/Users/dariusjankauskas/Programming/ts-to-zod/src/__tests__/common.ts": "export const Address = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
",
  "/Users/dariusjankauskas/Programming/ts-to-zod/src/__tests__/imported-type.test.ts": "import { Address } from "./common.ts";
const T = z.object({ firstName: z.string(), lastName: z.string(), address: z.lazy(() => Address).optional() });
",
}
`));
