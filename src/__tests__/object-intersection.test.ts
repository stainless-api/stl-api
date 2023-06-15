import { testCase } from "./testCase";

type T = { a: number } & { b: string };

it(
  `{a: number} & {b: string}`,
  testCase({
    __filename,
    expected: `z.object({ a: z.number() }).extend({ b: z.string() })`,
  })
);
