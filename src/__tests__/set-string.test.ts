import { testCase } from "./testCase";

type T = Set<string>;

it(
  `Set<string>`,
  testCase({
    __filename,
    expected: "z.set(z.string())",
  })
);
