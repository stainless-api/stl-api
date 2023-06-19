import { testCase } from "./testCase";

type T = readonly number[];

it(`readonly number[]`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.array(z.number())"`));
