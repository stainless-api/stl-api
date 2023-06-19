import { testCase } from "./testCase";

type T = { [k: string]: number };

it(`{[k: string]: number}`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.record(z.string(), z.number())"`));
