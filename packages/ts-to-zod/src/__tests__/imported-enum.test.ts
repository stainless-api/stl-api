import { Enum } from "./common";
import { multiFileTestCase } from "./multiFileTestCase";

type T = Enum[];

it(`imported enum`, async () =>
  expect(
  await multiFileTestCase({
    __filename
  })
).toMatchInlineSnapshot(`
{
  "src/__tests__/common.codegen.ts": "import { z } from "zod";
import { Enum as __enum_Enum } from "./common";
export const Enum = z.nativeEnum(__enum_Enum);
",
  "src/__tests__/imported-enum.test.codegen.ts": "import { z } from "zod";
import { Enum as __symbol_Enum } from "./common.codegen";
const T = z.array(z.lazy(() => __symbol_Enum));
",
}
`));
