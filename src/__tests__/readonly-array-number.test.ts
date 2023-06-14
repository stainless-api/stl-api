import { testCase } from "./testCase";

type T = readonly number[];

it(
  `readonly number[]`,
  testCase({
    __filename,
    expected: "z.array(z.number())",
  })
);
