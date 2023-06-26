import { AddrIface as Addr } from "./common";
import { multiFileTestCase } from "./multiFileTestCase";

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

it(`imported interface`, async () =>
  expect(
  await multiFileTestCase({
    __filename
  })
).toMatchInlineSnapshot(`
{
  "src/__tests__/common.codegen.ts": "import { z } from "zod";
export const AddressIface = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
",
  "src/__tests__/imported-aliased-interface.test.codegen.ts": "import { z } from "zod";
import { AddressIface as Addr } from "./common.codegen.ts";
const T = z.object({ firstName: z.string(), lastName: z.string(), address: z.lazy(() => Addr).optional() });
",
}
`));
