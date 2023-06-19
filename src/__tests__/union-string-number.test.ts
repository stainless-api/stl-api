import { testCase } from "./testCase";

type T = string | number;

it(`string | number`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.union([z.string(), z.number()])"`));
