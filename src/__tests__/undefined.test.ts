import { testCase } from "./testCase";

type T = undefined;

it(`undefined`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.undefined()"`));
