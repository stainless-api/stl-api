import { testCase } from "./testCase";

type T = { [k: string | number]: number };

it(`{[k: string | number]: number}`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(
    `"z.record(z.union([z.string(), z.number()]), z.number())"`
  ));
