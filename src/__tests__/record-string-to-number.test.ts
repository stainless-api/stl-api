import { testCase } from "./testCase";

type T = { [k: string]: number };

it(
  `{[k: string]: number}`,
  testCase({
    __filename,
    expected: `z.record(z.string(), z.number())`,
  })
);
