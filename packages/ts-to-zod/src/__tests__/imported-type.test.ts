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
    __filename
  })
).toMatchInlineSnapshot(`
{
  "src/__tests__/common.codegen.ts": "import { z } from "zod";
export const Address = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
",
  "src/__tests__/imported-type.test.codegen.ts": "import { z } from "zod";
import { Address } from "./common.codegen";
const T = z.object({ firstName: z.string(), lastName: z.string(), address: z.lazy(() => Address).optional() });
",
}
`));
