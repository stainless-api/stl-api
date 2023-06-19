import { testCase } from "./testCase";

type T =
  | { type: "a"; summary: "b" }
  | { type: "b" | "c"; summary: "b" | string };

it(`discriminated union`, () =>
  expect(
    testCase({
      __filename,
    })
  ).toMatchInlineSnapshot(
    `"z.discriminatedUnion("type", [z.object({ type: z.literal("a"), summary: z.literal("b") }), z.object({ type: z.enum(["b", "c"]), summary: z.string() })])"`
  ));
