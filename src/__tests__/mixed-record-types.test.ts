import { testCase } from "./testCase";

type T = {
  [k: string]: number;
  [z: symbol]: string;
};

it(`{ [k: string]: number; [z: symbol]: string }`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(
    `"z.union([z.record(z.symbol(), z.string()), z.record(z.string(), z.number())])"`
  ));
