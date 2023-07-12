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
  "src/__tests__/common.codegen.d.ts": "import { z } from "zod";
import { Enum as __enum_Enum } from "./common";
export const Enum: z.ZodTypeAny;
",
  "src/__tests__/common.codegen.js": "const { z } = require("zod");
const { Enum: __enum_Enum } = require("./common");
const Enum = z.nativeEnum(__enum_Enum);
exports.Enum = Enum;
",
  "src/__tests__/common.codegen.mjs": "import { z } from "zod";
import { Enum as __enum_Enum } from "./common";
export const Enum = z.nativeEnum(__enum_Enum);
",
  "src/__tests__/imported-enum.test.codegen.d.ts": "import { z } from "zod";
import { Enum as __enum_Enum } from "./common";
const T: z.ZodTypeAny;
",
  "src/__tests__/imported-enum.test.codegen.js": "const { z } = require("zod");
const { Enum: __enum_Enum } = require("./common");
const T = z.array(z.lazy(() => __enum_Enum));
",
  "src/__tests__/imported-enum.test.codegen.mjs": "import { z } from "zod";
import { Enum as __enum_Enum } from "./common";
const T = z.array(z.lazy(() => __enum_Enum));
",
}
`));
