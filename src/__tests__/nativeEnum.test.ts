import { testCase } from "./testCase";

enum T {
  a = "a",
  b = "b",
}

it(
  `enum T { a = 'a', b = 'b' }`,
  testCase({
    __filename,
    expected: `z.nativeEnum(__enum_T)`,
  })
);
