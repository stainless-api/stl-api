import { testCase } from "./testCase";

type T = { [k: string | number]: number };

it(
  `{[k: string | number]: number}`,
  testCase({
    __filename,
    expected: `z.record(z.union([z.string(), z.number()]), z.number())`,
  })
);
