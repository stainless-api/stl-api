import { testCase } from "./testCase";

type T = [string, number];

it(
  `[string, number]`,
  testCase({
    __filename,
    expected: "z.tuple([z.string(), z.number()])",
  })
);
