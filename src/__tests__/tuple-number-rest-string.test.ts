import { testCase } from "./testCase";

type T = [number, ...string[]];

it(
  `[number, ...string[]]`,
  testCase({
    __filename,
    expected: "z.tuple([z.number()]).rest(z.string())",
  })
);
