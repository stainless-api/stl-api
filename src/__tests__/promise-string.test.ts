import { testCase } from "./testCase";

type T = Promise<string>;

it(
  `Promise<string>`,
  testCase({
    __filename,
    expected: "z.promise(z.string())",
  })
);
