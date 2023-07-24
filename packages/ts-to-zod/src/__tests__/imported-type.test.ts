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
  "src/__tests__/common.codegen.ts": "import { z } from "zod";
export const Address: z.ZodTypeAny = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
",
  "src/__tests__/imported-type.test.codegen.ts": "import { z } from "zod";
import * as common from "./common";
const T: z.ZodTypeAny = z.object({ firstName: z.string(), lastName: z.string(), address: z.lazy(() => common.Address).optional() });
",
}
`));
