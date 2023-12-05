import { multiFileTestCase } from "./multiFileTestCase";

type T = {
  map: Map<string, number>;
  date: Date;
};

it(`native types`, async () =>
  expect(
    await multiFileTestCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`
{
  "src/__tests__/native-types.test.codegen.ts": "import { z } from "zod";
const T: z.ZodTypeAny = z.object({ map: z.map(z.string(), z.number()), date: z.date() });
",
}
`));
