import { testCase } from "./testCase";

type T = any;

it(`any`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.any()"`));
