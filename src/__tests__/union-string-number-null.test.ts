import { testCase } from "./testCase";

type T = string | number | null;

it(
  `string | number | null`,
  testCase({
    __filename,
    expected: `z.union([z.string(), z.number()]).nullable()`,
  })
);
