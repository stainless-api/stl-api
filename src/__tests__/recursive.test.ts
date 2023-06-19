import { testCase } from "./testCase";

type T = number | [T];

it(`number | [T]`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(
    `"z.union([z.number(), z.tuple([z.lazy(() => T)])])"`
  ));
