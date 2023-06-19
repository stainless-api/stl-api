import { testCase } from "./testCase";

interface T {
  a: number;
  b?: string;
}

it(`interface T { a: number, b?: string }`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(
    `"z.object({ a: z.number(), b: z.string().optional() })"`
  ));
