import { testCase } from "./testCase";

type T = false;

it(`false`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.literal(false)"`));
