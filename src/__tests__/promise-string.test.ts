import { testCase } from "./testCase";

type T = Promise<string>;

it(`Promise<string>`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.promise(z.string())"`));
