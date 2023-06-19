import { testCase } from "./testCase";

type T = boolean;

it(`boolean`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.boolean()"`));
