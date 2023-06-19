import { testCase } from "./testCase";

type T = unknown;

it(`unknown`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.unknown()"`));
