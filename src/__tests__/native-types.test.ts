import { testCase } from "./testCase";
import { genMultipleFiles } from "./genMultipleFiles";

type T = {
  map: Map<string, number>,
  date: Date,
};

it(`native types`, () =>
  expect(genMultipleFiles({ __filename })).toMatchInlineSnapshot(`
{
  "/Users/dariusjankauskas/Programming/ts-to-zod/src/__tests__/native-types.test.ts": "const T = z.object({ map: z.map(z.string(), z.number()), date: z.date() });
",
}
`));
