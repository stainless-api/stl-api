import { testCase } from "./testCase";

type T = number;

it(`number`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.number()"`));
