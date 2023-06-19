import { testCase } from "./testCase";

type ObjectWithMethod = {
    a: string,
    b: () => number,
};

it(`omit methods`, () =>
  expect(
  testCase({ __filename, nodeName: "ObjectWithMethod" })
).toMatchInlineSnapshot(`"z.object({ a: z.string() })"`));

type StringFunction = () => string;

it(`functions converted to any`, () => 
  expect(
  testCase({ __filename, nodeName: "StringFunction" })
).toMatchInlineSnapshot(`"z.any()"`)
)


