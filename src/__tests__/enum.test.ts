import { testCase } from "./testCase";

type T = "a" | "b";

it(`'a' | 'b'`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.enum(["a", "b"])"`));
