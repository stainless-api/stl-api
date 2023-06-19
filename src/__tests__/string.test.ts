import { testCase } from "./testCase";

type T = string;

it(`string`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.string()"`));
