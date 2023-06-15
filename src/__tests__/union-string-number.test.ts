import { testCase } from "./testCase";

type T = string | number;

it(
  `string | number`,
  testCase({
    __filename,
    expected: `z.union([z.string(), z.number()])`,
  })
);
