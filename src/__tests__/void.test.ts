import { testCase } from "./testCase";

type T = void;

it(
  `void`,
  testCase({
    __filename,
    expected: "z.void()",
  })
);
