import { testCase } from "./testCase";
import { Enum } from "./common";
import { genMultipleFiles } from "./genMultipleFiles";

type T = Enum[];


it(`imported enum`, () =>
  expect(genMultipleFiles({ __filename })).toMatchInlineSnapshot(`
{
  "/Users/dariusjankauskas/Programming/ts-to-zod/src/__tests__/common.ts": "import { Enum as __enum_Enum } from "./common.ts";
export const Enum = z.nativeEnum(__enum_Enum);
",
  "/Users/dariusjankauskas/Programming/ts-to-zod/src/__tests__/imported-enum.test.ts": "import { Enum } from "./common.ts";
const T = z.array(z.lazy(() => Enum));
",
}
`));

