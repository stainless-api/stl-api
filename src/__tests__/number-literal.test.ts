import { testCase } from "./testCase";

type T = 5;

it(
  `5`,
  testCase({
    __filename,
    expected: "z.literal(5)",
  })
);
