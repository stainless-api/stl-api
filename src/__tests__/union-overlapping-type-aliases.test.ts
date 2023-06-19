import { testCase } from "./testCase";

type Foo = "a" | "b";
type Bar = "b" | "c";

type T = Foo | Bar | null;

it(`Foo | Bar | null`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.enum(["a", "b", "c"]).nullable()"`));
