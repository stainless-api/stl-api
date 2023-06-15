import { testCase } from "./testCase";

type Obj<X> = {
  a: X;
  b?: "x";
};
type T = {
  [k in keyof Obj<number>]: NonNullable<Obj<number>[k]> extends string
    ? { string: NonNullable<Obj<number>[k]> }
    : { other: NonNullable<Obj<number>[k]> };
};

it(
  `mapped type`,
  testCase({
    __filename,
    expected: `z.object({ a: z.object({ other: z.number() }), b: z.object({ string: z.literal("x") }).optional() })`,
  })
);
