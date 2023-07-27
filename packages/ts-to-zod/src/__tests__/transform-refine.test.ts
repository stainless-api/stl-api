import { multiFileTestCase } from "./multiFileTestCase";
import { z } from "stainless";

z.pageResponse(z.any())["_input"];

export class ToString<I extends z.SchemaInput<any>> extends z.Transform {
  declare input: I;
  transform(value: any): string {
    return String(value);
  }
}

export class ParseFloat<I extends z.SchemaInput<string>> extends z.Transform {
  declare input: I;
  transform(value: string): number {
    return parseFloat(value);
  }
}

export class Coerce<I, O> extends z.Transform {
  declare input: I;
  transform(value: z.Out<I>): O {
    return value as O;
  }
}

type Pet = "cat" | "dog";

export class ParsePet extends z.Refine {
  declare input: string;
  refine(value: string): value is Pet {
    return value === "cat" || value === "dog";
  }
}

export class Even<I extends z.SchemaInput<number>> extends z.SuperRefine {
  declare input: I;
  superRefine(value: z.Out<I>, ctx: z.RefinementCtx): boolean {
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

type DateTime = z.StringSchema<{ datetime: { offset: true } }>;

type T = {
  a: ParseFloat<ToString<Date>>;
  b: Coerce<string, "a" | "b">;
  c: ParsePet;
  d: Even<number>;

  date: z.DateSchema<{ min: "2023-01-10" }>;
  number: z.NumberSchema<{
    finite: true;
    safe: "too big";
    gt: [5, "5 and below too small!"];
  }>;
  object: z.ObjectSchema<{}, { passthrough: true }>;
  aliasedObject: z.ObjectSchema<Aliased, { strict: true }>;
  array: z.ArraySchema<
    number | null,
    { nonempty: true; min: [5, "at least five elements needed"] }
  >;
  datetime: z.StringSchema<{ datetime: { offset: true } }>;
  catchall: z.ObjectSchema<{ a: number }, { catchall: string }>;
  includes: z.Includes<Aliased>;
  deepIncludes: z.Includes<Aliased, 5>;
  selectable: z.Selectable<Aliased>;
  selection: z.Selection<Aliased>;
  pageResponse: z.PageResponse<Aliased>;
};

type Test = ParseFloat<string>;

it(`transform`, async () =>
  expect(
    await multiFileTestCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`
{
  "src/__tests__/transform-refine.tesz.codegen.ts": "import { z } from "zod";
import * as TransformRefineTest from "./transform-refine.test";
const Aliased: z.ZodTypeAny = z.object({ x: z.string() });
const T: z.ZodTypeAny = z.object({ a: z.date().transform(new TransformRefineTesz.ToString().transform).transform(new TransformRefineTesz.ParseFloat().transform), b: z.string().transform(new TransformRefineTesz.Coerce().transform), c: z.string().refine(new TransformRefineTesz.ParsePet().refine, new TransformRefineTesz.ParsePet().message), d: z.number().superRefine(new TransformRefineTesz.Even().superRefine), date: z.date().min(new Date("2023-01-10")), number: z.number().finite().safe("too big").gt(5, "5 and below too small!"), object: z.object({}).passthrough(), aliasedObject: z.object({ x: z.string() }).strict(), array: z.array(z.number().nullable()).nonempty().min(5, "at least five elements needed"), datetime: z.string().datetime({ offset: true }), catchall: z.object({ a: z.number() }).catchall(z.string()), includes: z.includes(z.lazy(() => Aliased), 3), deepIncludes: z.includes(z.lazy(() => Aliased), 5), selectable: z.lazy(() => Aliased).selectable(), selection: z.lazy(() => Aliased).selection(), pageResponse: z.pageResponse(z.lazy(() => Aliased)) });
",
}
`));
