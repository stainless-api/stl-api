import { testCase } from "./testCase";

type T = 5;

it(`5`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.literal(5)"`));
