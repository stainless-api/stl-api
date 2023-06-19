import { testCase } from "./testCase";

type Foo = "a" | "b";
type Bar = "c" | "d";

type T = Foo | Bar | null;

it(`Foo | Bar | null`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(
    `"z.union([z.lazy(() => Foo), z.lazy(() => Bar)]).nullable()"`
  ));
