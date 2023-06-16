import { testCase } from "./testCase";

type T = {type: 'a', summary: 'b'} | {type: 'b' | 'c', summary: 'b' | string } ;

it(
  `discriminated union`,
  testCase({
    __filename,
    expected: `z.discriminatedUnion(\"type\", [z.object({ type: z.literal(\"a\"), summary: z.literal(\"b\") }), z.object({ type: z.enum([\"b\", \"c\"]), summary: z.string() })])`,
  })
);
