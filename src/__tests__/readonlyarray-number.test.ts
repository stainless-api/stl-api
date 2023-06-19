import { testCase } from "./testCase";

type T = ReadonlyArray<number>;

it(`ReadonlyArray<number>`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.array(z.number())"`));
