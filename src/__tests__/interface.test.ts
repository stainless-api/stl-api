import { testCase } from "./testCase";

interface T {
  a: number;
  b?: string;
}

it(
  `interface T { a: number, b?: string }`,
  testCase({
    __filename,
    expected: `z.object({ a: z.number(), b: z.string().optional() })`,
  })
);
