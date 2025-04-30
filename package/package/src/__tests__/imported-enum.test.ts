import { Enum } from "./common";
import { multiFileTestCase } from "./multiFileTestCase";

type T = Enum[];

it(`imported enum`, async () =>
  expect(
    await multiFileTestCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`
{
  "src/__tests__/common.codegen.ts": "import { z } from "zod";
import * as Common from "./common";
export const Enum: z.ZodTypeAny = z.nativeEnum(Common.Enum);
",
  "src/__tests__/imported-enum.test.codegen.ts": "import { z } from "zod";
import * as Common from "./common";
const T: z.ZodTypeAny = z.array(z.lazy(() => Common.Enum));
",
}
`));
