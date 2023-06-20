import { multiFileTestCase } from "./multiFileTestCase";
import { TypeSchema, Transform, output } from "../index";

class ToString<I extends TypeSchema<any>> extends Transform<string, I> {
  transform(value: output<I>): string {
    return String(value);
  }
}

class ParseFloat<I extends TypeSchema<string>> extends Transform<number, I> {
  transform(value: output<I>): number {
    return parseFloat(value);
  }
}

class Coerce<O, I> extends Transform<O, I> {
  transform(value: output<I>): O {
    return value as O;
  }
}

type T = {
  a: ParseFloat<ToString<Date>>;
  b: Coerce<"a" | "b", string>;
};

it(`transform`, async () =>
  expect(
    await multiFileTestCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`
{
  "src/__tests__/transform.test.codegen.ts": "import { ParseFloat, ToString, Coerce } from "./transform.test.codegen.ts";
const T = z.object({ a: z.date().transform(new ToString().transform).transform(new ParseFloat().transform), b: z.string().transform(new Coerce().transform) });
",
}
`));
