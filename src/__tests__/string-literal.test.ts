import { testCase } from "./testCase";

type T = "a";

it(
  `"a"`,
  testCase({
    __filename,
    expected: `z.literal("a")`,
  })
);
