import { testCase } from "./testCase";

type T = undefined;

it(
  `undefined`,
  testCase({
    __filename,
    expected: "z.undefined()",
  })
);
