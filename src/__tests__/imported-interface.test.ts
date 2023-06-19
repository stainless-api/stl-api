import { AddressIface } from "./common";
import { multiFileTestCase } from "./multiFileTestCase";

interface T {
  firstName: string;
  lastName: string;
  address?: AddressIface;
}

it(`imported interface`, () =>
  expect(
    multiFileTestCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`
    {
      "src/__tests__/common.codegen.ts": "export const AddressIface = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
    ",
      "src/__tests__/imported-interface.test.codegen.ts": "import { AddressIface } from "./common.codegen.ts";
    const T = z.object({ firstName: z.string(), lastName: z.string(), address: z.lazy(() => AddressIface).optional() });
    ",
    }
  `));
