import { multiFileTestCase } from "./multiFileTestCase";

type T = number | [U];
type U = string | [T];

it(`mutual recursion`, () =>
  expect(
    multiFileTestCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`
    {
      "src/__tests__/mutual-recursion.test.codegen.ts": "const U = z.union([z.string(), z.tuple([z.lazy(() => T)])]);
    const T = z.union([z.number(), z.tuple([z.lazy(() => U)])]);
    ",
    }
  `));
