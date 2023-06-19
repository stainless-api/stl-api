import { testCase } from "./testCase";

type T = null;

it(`null`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.null()"`));
