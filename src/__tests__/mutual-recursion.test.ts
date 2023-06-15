import { genMultipleFiles } from "./genMultipleFiles";

type T = number | [U];
type U = string | [T];

it(`mutual recursion`, () =>
  expect(genMultipleFiles({ __filename })).toMatchInlineSnapshot(`
{
  "/Users/dariusjankauskas/Programming/ts-to-zod/src/__tests__/mutual-recursion.test.ts": "const U = z.union([z.string(), z.tuple([z.lazy(() => T)])]);
const T = z.union([z.number(), z.tuple([z.lazy(() => U)])]);
",
}
`));
