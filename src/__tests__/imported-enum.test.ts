import { testCase } from "./testCase";
import { Enum } from "./common";
import { genMultipleFiles } from "./genMultipleFiles";

type T = Enum[];


it(`imported enum`, () =>
  expect(genMultipleFiles({ __filename })).toMatchInlineSnapshot(`
{
  "src/__tests__/common.codegen.ts": "import { Enum as __enum_Enum } from "./common.ts";
export const Enum = z.nativeEnum(__enum_Enum);
",
  "src/__tests__/imported-enum.test.codegen.ts": "import { Enum } from "./common.ts";
const T = z.array(z.lazy(() => Enum));
",
}
`));

