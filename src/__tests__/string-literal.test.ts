import { testCase } from "./testCase";

type T = "a";

it(`"a"`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.literal("a")"`));
