import { testCase } from "./testCase";

type T = Map<string, number>;

it(
  `Map<string, number>`,
  testCase({
    __filename,
    expected: "z.map(z.string(), z.number())",
  })
);
