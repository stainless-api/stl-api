import { testCase } from "./testCase";

type T = any;

it(
  `any`,
  testCase({
    __filename,
    expected: "z.any()",
  })
);
