import { testCase } from "./testCase";

type T = Array<number>;

it(
  `Array<number>`,
  testCase({
    __filename,
    expected: "z.array(z.number())",
  })
);
