import { multiFileTestCase } from "./multiFileTestCase";
import { TypeSchema, Transform, Refine, SuperRefine, output } from "../index";
import z from "zod";

class ToString<I extends TypeSchema<any>> extends Transform<I, string> {
  transform(value: output<I>): string {
    return String(value);
  }
}

class ParseFloat<I extends TypeSchema<string>> extends Transform<I, number> {
  transform(value: output<I>): number {
    return parseFloat(value);
  }
}

class Coerce<I, O> extends Transform<I, O> {
  transform(value: output<I>): O {
    return value as O;
  }
}

type Pet = "cat" | "dog";

class ParsePet extends Refine<string, Pet> {
  refine(value: string): value is Pet {
    return value === "cat" || value === "dog";
  }
}

class Even<I extends TypeSchema<number>> extends SuperRefine<I> {
  superRefine(value: output<I>, ctx: z.RefinementCtx) {
    if (value % 2 !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Evens only",
      });
    }
  }
}


type T = {
  a: ParseFloat<ToString<Date>>;
  b: Coerce<string, "a" | "b">;
  c: ParsePet;
  d: Even<number>;
};

it(`transform`, async () =>
  expect(
  await multiFileTestCase({
    __filename
  })
).toMatchInlineSnapshot(`
{
  "src/__tests__/transform.test.codegen.ts": "import { ParseFloat, ToString, Coerce, ParsePet, Even } from "./transform.test.ts";
const T = z.object({ a: z.date().transform(new ToString().transform).transform(new ParseFloat().transform), b: z.string().transform(new Coerce().transform), c: z.string().refine(new ParsePet().refine, new ParsePet().message), d: z.number().superRefine(new Even().superRefine) });
",
}
`));
