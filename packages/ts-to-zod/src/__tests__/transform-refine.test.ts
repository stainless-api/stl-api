import { multiFileTestCase } from "./multiFileTestCase";
import { z, t } from "stainless";

z.pageResponse(z.any())["_input"];

type Pet = "cat" | "dog";

export class ParsePet extends t.Schema<Pet, string> {
  validate(value: string): value is Pet {
    return value === "cat" || value === "dog";
  }
}

type Aliased = { x: string };

type DateTime = t.StringSchema<{ datetime: { offset: true } }>;

type T = {
  c: ParsePet;

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

it(`transform`, async () =>
  expect(
    await multiFileTestCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`
{
  "src/__tests__/transform-refine.test.codegen.ts": "import { z } from "zod";
import * as TransformRefineTest from "./transform-refine.test";
import * as TD from "../../../stainless/dist/t.d";
const Aliased: z.ZodTypeAny = z.object({ x: z.string() });
const T: z.ZodTypeAny = z.object({ c: z.string().refine(new TransformRefineTest.ParsePet().validate), date: z.date().min(new Date("2023-01-10")), number: z.number().finite().safe("too big").gt(5, "5 and below too small!"), object: z.object({}).passthrough(), aliasedObject: z.object({ x: z.string() }).strict(), array: z.array(z.number().nullable()).nonempty().min(5, "at least five elements needed"), datetime: z.string().datetime({ offset: true }), catchall: z.object({ a: z.number() }).catchall(z.string()), includes: z.string(), deepIncludes: z.string(), selectable: z.union([z.object({ x: z.string() }), z.object({ x: z.string().optional() })]).nullable().optional(), selection: z.lazy(() => Aliased), pageResponse: z.object({ startCursor: z.string().nullable(), endCursor: z.string().nullable(), hasNextPage: z.boolean().optional(), hasPreviousPage: z.boolean().optional(), items: z.array(z.lazy(() => Aliased)) }) });
",
}
`));
