import { testCase } from "./testCase";

type T = ReadonlyArray<number>;

it(
  `ReadonlyArray<number>`,
  testCase({
    __filename,
    expected: "z.array(z.number())",
  })
);
