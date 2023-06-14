import { testCase } from "./testCase";

type Obj = {
  a: number;
  b?: "x";
};
type T = {
  [k in keyof Obj]: NonNullable<Obj[k]> extends string
    ? { string: NonNullable<Obj[k]> }
    : { other: NonNullable<Obj[k]> };
};

it(
  `mapped type`,
  testCase({
    __filename,
    expected: `z.object({ a: z.object({ other: z.number() }), b: z.object({ string: z.literal("x") }).optional() })`,
  })
);
