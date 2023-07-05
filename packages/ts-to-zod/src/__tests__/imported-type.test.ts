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
  "src/__tests__/common.codegen.d.ts": "import { z } from "zod";
export const Address: z.ZodTypeAny;
",
  "src/__tests__/common.codegen.js": "const { z } = require("zod");
exports.Address = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
",
  "src/__tests__/common.codegen.mjs": "import { z } from "zod";
export const Address = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
",
  "src/__tests__/imported-type.test.codegen.d.ts": "import { z } from "zod";
import { Address as __symbol_Address } from "./common";
const T: z.ZodTypeAny;
",
  "src/__tests__/imported-type.test.codegen.js": "const { z } = require("zod");
const { Address: __symbol_Address } = require("./common");
const T = z.object({ firstName: z.string(), lastName: z.string(), address: z.lazy(() => __symbol_Address).optional() });
",
  "src/__tests__/imported-type.test.codegen.mjs": "import { z } from "zod";
import { Address as __symbol_Address } from "./common";
const T = z.object({ firstName: z.string(), lastName: z.string(), address: z.lazy(() => __symbol_Address).optional() });
",
}
`));
