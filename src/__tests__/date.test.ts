import { testCase } from "./testCase";

type T = Date;

it(`Date`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`"z.date()"`));
