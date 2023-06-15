import { testCase } from "./testCase";

type T = null;

it(
  `null`,
  testCase({
    __filename,
    expected: "z.null()",
  })
);
