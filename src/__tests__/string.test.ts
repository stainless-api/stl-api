import { testCase } from "./testCase";

type T = string;

it(
  `string`,
  testCase({
    __filename,
    expected: "z.string()",
  })
);
