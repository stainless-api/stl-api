import { testCase } from "./testCase";

type T = true;

it(`true`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.literal(true)"`));
