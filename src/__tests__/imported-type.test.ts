import { Address } from "./common";
import { multiFileTestCase } from "./multiFileTestCase";

type T = {
  firstName: string;
  lastName: string;
  address?: Address;
};

it(`imported type`, async () =>
  expect(
    await multiFileTestCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`
    {
      "src/__tests__/common.codegen.ts": "export const Address = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
    ",
      "src/__tests__/imported-type.test.codegen.ts": "import { Address } from "./common.codegen.ts";
    const T = z.object({ firstName: z.string(), lastName: z.string(), address: z.lazy(() => Address).optional() });
    ",
    }
  `));
