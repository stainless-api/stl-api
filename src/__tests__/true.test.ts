import { testCase } from "./testCase";

type T = true;

it(
  `true`,
  testCase({
    __filename,
    expected: "z.literal(true)",
  })
);
