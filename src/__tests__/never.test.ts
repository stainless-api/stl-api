import { testCase } from "./testCase";

type T = never;

it(
  `never`,
  testCase({
    __filename,
    expected: "z.never()",
  })
);
