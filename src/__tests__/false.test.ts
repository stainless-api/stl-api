import { testCase } from "./testCase";

type T = false;

it(
  `false`,
  testCase({
    __filename,
    expected: "z.literal(false)",
  })
);
