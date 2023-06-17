import { genMultipleFiles } from "./genMultipleFiles";
import { TypeSchema, Transform, input } from "../index";

class ToString<I extends TypeSchema<any>> extends Transform<string, I> {
  transform(value: input<I>): string {
    return String(value);
  }
}

class ParseFloat<I extends TypeSchema<string>> extends Transform<number, I> {
  transform(value: input<I>): number {
    return parseFloat(value);
  }
}

type T = {
  a: ParseFloat<ToString<Date>>;
};

it(`transform`, () =>
  expect(genMultipleFiles({ __filename })).toMatchInlineSnapshot(`
    {
      "/Users/andy/gh/ts-to-zod/src/__tests__/transform.test.ts": "import { ParseFloat, ToString } from "./transform.test.ts";
    const T = z.object({ a: z.date().transform(new ToString().transform).transform(new ParseFloat().transform) });
    ",
    }
  `));
