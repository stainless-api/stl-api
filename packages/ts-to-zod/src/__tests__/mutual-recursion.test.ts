import { testCase } from "./testCase";
import { multiFileTestCase } from "./multiFileTestCase";

type T = number | [U];
type U = string | [T];

it(`mutual recursion`, async () =>
  expect(
    await multiFileTestCase({
      __filename,
    }),
  ).toMatchInlineSnapshot(`
{
  "src/__tests__/mutual-recursion.test.codegen.ts": "import { z } from "zod";
const U: z.ZodTypeAny = z.union([z.string(), z.tuple([z.lazy(() => T)])]);
const T: z.ZodTypeAny = z.union([z.number(), z.tuple([z.lazy(() => U)])]);
",
}
`));

// TODO: generate error for this case
// type X<T> = {
//   a: number;
//   x?: X<T>;
// };
//
// type XString = X<string>;
//
// it(`generic mutual recursion`, async () =>
//   expect(await testCase({ __filename, nodeName: "XString" })).toMatchInlineSnapshot(``));
