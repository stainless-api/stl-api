import { multiFileTestCase } from "./multiFileTestCase";

type T = {
  map: Map<string, number>;
  date: Date;
};

it(`native types`, async () =>
  expect(
  await multiFileTestCase({
    __filename
  })
).toMatchInlineSnapshot(`
{
  "src/__tests__/native-types.test.codegen.d.ts": "import { z } from "zod";
const T: z.ZodTypeAny;
",
  "src/__tests__/native-types.test.codegen.js": "const { z } = require("zod");
const T = z.object({ map: z.map(z.string(), z.number()), date: z.date() });
",
  "src/__tests__/native-types.test.codegen.mjs": "import { z } from "zod";
const T = z.object({ map: z.map(z.string(), z.number()), date: z.date() });
",
}
`));
