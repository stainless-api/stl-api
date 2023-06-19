import { testCase } from "./testCase";

type T = { a: number } & { b: string };

it(`{a: number} & {b: string}`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(
    `"z.object({ a: z.number() }).and(z.object({ b: z.string() }))"`
  ));
