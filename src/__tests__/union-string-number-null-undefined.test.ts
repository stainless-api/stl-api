import { testCase } from "./testCase";

type T = string | number | null | undefined;

it(
  `string | number | null | undefined`,
  testCase({
    __filename,
    expected: `z.union([z.string(), z.number()]).nullable().optional()`,
  })
);
