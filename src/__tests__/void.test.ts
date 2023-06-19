import { testCase } from "./testCase";

type T = void;

it(`void`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.void()"`));
