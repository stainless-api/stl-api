import { testCase } from "./testCase";

type Foo = "a" | "b";
type Bar = "b" | "c";

type T = Foo | Bar | null;

it(
  `Foo | Bar | null`,
  testCase({
    __filename,
    expected: `z.union([z.enum(["a", "b"]), z.enum(["b", "c"])]).nullable()`,
  })
);
