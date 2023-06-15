import { testCase } from "./testCase";

type T = string | number | undefined;

it(
  `string | number | undefined`,
  testCase({
    __filename,
    expected: `z.union([z.string(), z.number()]).optional()`,
  })
);
