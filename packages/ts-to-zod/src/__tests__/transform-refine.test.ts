import { multiFileTestCase } from "./multiFileTestCase";
import { z, t } from "stainless";

z.pageResponse(z.any())["_input"];

export class ToString<I extends t.SchemaInput<any>> extends t.Transform {
  declare input: I;
  transform(value: any): string {
    return String(value);
  }
}

export class ParseFloat<I extends t.SchemaInput<string>> extends t.Transform {
  declare input: I;
  transform(value: string): number {
    return parseFloat(value);
  }
}

export class Coerce<I, O> extends t.Transform {
  declare input: I;
  transform(value: t.output<I>): O {
    return value as O;
  }
}

type Pet = "cat" | "dog";

export class ParsePet extends t.Refine {
  declare input: string;
  refine(value: string): value is Pet {
    return value === "cat" || value === "dog";
  }
}

export class Even<I extends t.SchemaInput<number>> extends t.SuperRefine {
  declare input: I;
  superRefine(value: t.output<I>, ctx: z.RefinementCtx): boolean {
    if (value % 2 !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Evens only",
      });
      return false;
    } else return true;
  }
}

type Aliased = { x: string };

type DateTime = t.StringSchema<{ datetime: { offset: true } }>;

type T = {
  a: ParseFloat<ToString<Date>>;
  b: Coerce<string, "a" | "b">;
  c: ParsePet;
  d: Even<number>;

  date: t.DateSchema<{ min: "2023-01-10" }>;
  number: t.NumberSchema<{
    finite: true;
    safe: "too big";
    gt: [5, "5 and below too small!"];
  }>;
  object: t.ObjectSchema<{}, { passthrough: true }>;
  aliasedObject: t.ObjectSchema<Aliased, { strict: true }>;
  array: t.ArraySchema<
    number | null,
    { nonempty: true; min: [5, "at least five elements needed"] }
  >;
  datetime: t.StringSchema<{ datetime: { offset: true } }>;
  catchall: t.ObjectSchema<{ a: number }, { catchall: string }>;
  includes: t.Includes<Aliased>;
  deepIncludes: t.Includes<Aliased, 5>;
  selectable: t.Selectable<Aliased>;
  selection: t.Selection<Aliased>;
  pageResponse: t.PageResponse<Aliased>;
};

type Test = ParseFloat<string>;

it(`transform`, async () =>
  expect(
    await multiFileTestCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`
{
  "src/__tests__/transform-refine.test.codegen.ts": "import { z } from "zod";
import * as transform_refine_test from "./transform-refine.test";
const Aliased: z.ZodTypeAny = z.object({ x: z.string() });
const T: z.ZodTypeAny = z.object({ a: z.date().transform(new transform_refine_test.ToString().transform).transform(new transform_refine_test.ParseFloat().transform), b: z.string().transform(new transform_refine_test.Coerce().transform), c: z.string().refine(new transform_refine_test.ParsePet().refine, new transform_refine_test.ParsePet().message), d: z.number().superRefine(new transform_refine_test.Even().superRefine), date: z.date().min(new Date("2023-01-10")), number: z.number().finite().safe("too big").gt(5, "5 and below too small!"), object: z.object({}).passthrough(), aliasedObject: z.object({ x: z.string() }).strict(), array: z.array(z.number().nullable()).nonempty().min(5, "at least five elements needed"), datetime: z.string().datetime({ offset: true }), catchall: z.object({ a: z.number() }).catchall(z.string()), includes: z.includes(z.lazy(() => Aliased), 3), deepIncludes: z.includes(z.lazy(() => Aliased), 5), selectable: z.lazy(() => Aliased).selectable(), selection: z.lazy(() => Aliased).selection(), pageResponse: z.pageResponse(z.lazy(() => Aliased)) });
",
}
`));
