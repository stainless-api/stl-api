import { testCase } from "./testCase";

type T = never;

it(`never`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.never()"`));
