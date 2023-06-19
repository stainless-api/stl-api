import { testCase } from "./testCase";

enum T {
  a = "a",
  b = "b",
}

it(`enum T { a = 'a', b = 'b' }`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.nativeEnum(__enum_T)"`));
