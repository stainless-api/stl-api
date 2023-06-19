import { testCase } from "./testCase";

type T = string | number | null | undefined;

it(`string | number | null | undefined`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(
    `"z.union([z.string(), z.number()]).nullable().optional()"`
  ));
