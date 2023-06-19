import { testCase } from "./testCase";

type T = [string, number];

it(`[string, number]`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.tuple([z.string(), z.number()])"`));
