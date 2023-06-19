import { testCase } from "./testCase";

type T = Array<number>;

it(`Array<number>`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.array(z.number())"`));
