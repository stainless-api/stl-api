import { testCase } from "./testCase";

type T = bigint;

it(`bigint`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.bigint()"`));
