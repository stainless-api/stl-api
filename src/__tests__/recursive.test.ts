import { testCase } from "./testCase";

type T = number | [T];

it(
  `number | [T]`,
  testCase({
    __filename,
    expected: "z.union([z.number(), z.tuple([z.lazy(() => T)])])",
  })
);
