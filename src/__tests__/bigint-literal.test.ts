import { testCase } from "./testCase";

type T = 5n;

it(`5n`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.literal(5n)"`));
