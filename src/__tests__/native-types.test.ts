import { testCase } from "./testCase";
import { multiFileTestCase } from "./multiFileTestCase";

type T = {
  map: Map<string, number>;
  date: Date;
};

it(`native types`, () =>
  expect(
    multiFileTestCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`
    {
      "src/__tests__/native-types.test.codegen.ts": "const T = z.object({ map: z.map(z.string(), z.number()), date: z.date() });
    ",
    }
  `));
