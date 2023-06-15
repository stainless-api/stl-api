import { AddressIface } from "./common";
import { genMultipleFiles } from "./genMultipleFiles";

interface T {
  firstName: string;
  lastName: string;
  address?: AddressIface;
}

it(`imported interface`, () =>
  expect(genMultipleFiles({ __filename })).toMatchInlineSnapshot(`
{
  "/Users/dariusjankauskas/Programming/ts-to-zod/src/__tests__/common.ts": "export const AddressIface = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
",
  "/Users/dariusjankauskas/Programming/ts-to-zod/src/__tests__/imported-interface.test.ts": "import { AddressIface } from "./common.ts";
const T = z.object({ firstName: z.string(), lastName: z.string(), address: z.lazy(() => AddressIface).optional() });
",
}
`));
