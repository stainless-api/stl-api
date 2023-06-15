import { testCase } from "./testCase";

type T = number;

it(
  `number`,
  testCase({
    __filename,
    expected: "z.number()",
  })
);
