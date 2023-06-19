import { testCase } from "./testCase";

type T = string | number | null;

it(`string | number | null`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.union([z.string(), z.number()]).nullable()"`));
