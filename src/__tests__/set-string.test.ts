import { testCase } from "./testCase";

type T = Set<string>;

it(`Set<string>`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.set(z.string())"`));
