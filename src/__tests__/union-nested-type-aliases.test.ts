import { testCase } from "./testCase";

type Foo = 1 | 2;
type Bar = 2 | 3;

type T = Foo | Bar | null;

it(
  `Foo | Bar | null`,
  testCase({
    __filename,
    expected: `z.union([z.union(z.literal(1), z.literal(2)), z.union(z.literal(2), z.literal(3))]).nullable()`,
  })
);
