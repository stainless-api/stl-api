import { testCase } from "./testCase";

type T = {
    a: string,
    b: () => number,
};

it(
  `omit methods`,
  testCase({
    __filename,
    expected: `z.object({ a: z.string() })`,
  })
);



