import { testCase } from "./testCase";

type T = "a" | "b";

it(
  `'a' | 'b'`,
  testCase({
    __filename,
    expected: `z.enum(["a", "b"])`,
  })
);
