import { testCase } from "./testCase";

type T = Map<string, number>;

it(`Map<string, number>`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.map(z.string(), z.number())"`));
