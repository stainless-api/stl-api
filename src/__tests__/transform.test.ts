import { multiFileTestCase } from "./multiFileTestCase";
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

class Coerce<I, O> extends Transform<O, I> {
  transform(value: input<O>): O {
    return value as O;
  }
}

type T = {
  a: ParseFloat<ToString<Date>>;
  b: Coerce<string, "a" | "b">;
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
