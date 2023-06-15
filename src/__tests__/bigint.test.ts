import { testCase } from "./testCase";

type T = bigint;

it(
  `bigint`,
  testCase({
    __filename,
    expected: "z.bigint()",
  })
);
