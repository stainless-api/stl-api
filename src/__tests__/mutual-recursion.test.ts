import { testCase } from "./testCase";

type T = number | [U];
type U = string | [T];

it(
  `mutual recursion`,
  testCase({
    __filename,
    expected: "z.union([z.number(), z.tuple([z.lazy(() => U)])])",
  })
);
