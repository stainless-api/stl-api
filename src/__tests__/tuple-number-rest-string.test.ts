import { testCase } from "./testCase";

type T = [number, ...string[]];

it(`[number, ...string[]]`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.tuple([z.number()]).rest(z.string())"`));
