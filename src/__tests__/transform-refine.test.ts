import { multiFileTestCase } from "./multiFileTestCase";
import { z } from "stainless";

z.pageResponse(z.any())["_input"];

type Pet = "cat" | "dog";

export class ParsePet extends z.Schema<Pet, string> {
  validate(value: string): value is Pet {
    return value === "cat" || value === "dog";
  }
}

type Aliased = { x: string };

type DateTime = z.StringSchema<{ datetime: { offset: true } }>;

type T = {
  c: ParsePet;

  date: z.DateSchema<{ min: "2023-01-10" }>;
  number: z.NumberSchema<{
    finite: true;
    safe: "too big";
    gt: [5, "5 and below too small!"];
    default: 10;
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

it(`transform`, async () =>
  expect(
    await multiFileTestCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`
    {
      "src/__tests__/transform-refine.test.codegen.ts": "import { z } from "zod";
    import * as TransformRefineTest from "./transform-refine.test";
    export const ParsePet: z.ZodTypeAny = z.string().refine(new TransformRefineTest.ParsePet().validate);
    const Aliased: z.ZodTypeAny = z.object({ x: z.string() });
    const T: z.ZodTypeAny = z.object({ c: z.lazy(() => ParsePet), date: z.date().min(new Date("2023-01-10")), number: z.number().finite().safe("too big").gt(5, "5 and below too small!").default(10), object: z.object({}).passthrough(), aliasedObject: z.object({ x: z.string() }).strict(), array: z.array(z.number().nullable()).nonempty().min(5, "at least five elements needed"), datetime: z.string().datetime({ offset: true }), catchall: z.object({ a: z.number() }).catchall(z.string()), includes: z.includes(z.lazy(() => Aliased), 3), deepIncludes: z.includes(z.lazy(() => Aliased), 5), selectable: z.lazy(() => Aliased).selectable(), selection: z.lazy(() => Aliased).selection(), pageResponse: z.pageResponse(z.lazy(() => Aliased)) });
    ",
    }
  `));
