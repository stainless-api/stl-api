import { testCase } from "./testCase";

type T = string | number | undefined;

it(`string | number | undefined`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.union([z.string(), z.number()]).optional()"`));
