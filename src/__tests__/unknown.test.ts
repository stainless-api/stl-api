import { testCase } from "./testCase";

type T = unknown;

it(
  `unknown`,
  testCase({
    __filename,
    expected: "z.unknown()",
  })
);
