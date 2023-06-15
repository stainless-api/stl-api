import { AddrIface as Addr } from "./common";
import { genMultipleFiles } from "./genMultipleFiles";

type Addr2 = Addr;

type AddressIface = {};

interface T {
  firstName: string;
  lastName: string;
  address?: Addr2;
}

/**
 * export const path_to_file_AddressIface = z.object({...})
 * export { path_to_file_AddressIface as AddressIface }
 */

it(`imported interface`, () =>
  expect(genMultipleFiles({ __filename })).toMatchInlineSnapshot(`
{
  "/Users/dariusjankauskas/Programming/ts-to-zod/src/__tests__/common.ts": "export const AddressIface = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
",
  "/Users/dariusjankauskas/Programming/ts-to-zod/src/__tests__/imported-aliased-interface.test.ts": "import { AddressIface as Addr } from "./common.ts";
const T = z.object({ firstName: z.string(), lastName: z.string(), address: z.lazy(() => Addr).optional() });
",
}
`));
