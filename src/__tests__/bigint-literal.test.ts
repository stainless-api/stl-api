import { testCase } from "./testCase";

type T = 5n;

it(
  `5n`,
  testCase({
    __filename,
    expected: "z.literal(5n)",
  })
);
