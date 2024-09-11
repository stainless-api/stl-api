import { testCase } from "./testCase";

type functionProp = {
  a: string;
  b: () => number;
};

it(`function property`, () =>
  expect(
    testCase({ __filename, nodeName: "functionProp" }),
  ).toMatchInlineSnapshot(
    `"z.object({ a: z.string(), b: z.function(z.tuple([]), z.number()) })"`,
  ));

type stringFunction = () => string;

it(`functions converted to any`, () =>
  expect(
    testCase({ __filename, nodeName: "stringFunction" }),
  ).toMatchInlineSnapshot(`"z.function(z.tuple([]), z.string())"`));

function complexFunction(a: number): string;
function complexFunction(a: string): string;
function complexFunction(a: number | string): string {
  return a.toString();
}

type multiSigFunction = typeof complexFunction;

it(`multi-signature function`, () =>
  expect(
    testCase({ __filename, nodeName: "multiSigFunction" }),
  ).toMatchInlineSnapshot(
    `"z.function(z.tuple([z.number()]), z.string()).and(z.function(z.tuple([z.string()]), z.string()))"`,
  ));

function generic<T>(_: T): never {
  throw new Error();
}

type instantiatedGeneric = typeof generic<number>;

it(`resolved function`, () =>
  expect(
    testCase({ __filename, nodeName: "instantiatedGeneric" }),
  ).toMatchInlineSnapshot(`"z.function(z.tuple([z.number()]), z.never())"`));

type genericFunction = typeof generic;

it(`generic function any`, () =>
  expect(
    testCase({ __filename, nodeName: "genericFunction" }),
  ).toMatchInlineSnapshot(`"z.any()"`));
