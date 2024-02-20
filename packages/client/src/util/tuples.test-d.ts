import { describe, expectTypeOf, test } from "vitest";
import type { SplitHeadAndTail, Shift } from "./tuples";

describe("Tuples", () => {
  test("shift", () => {
    type MyTuple = [1, 2, 3, 4];
    type Shifted = Shift<MyTuple>;
    expectTypeOf<Shifted>().toMatchTypeOf<[2, 3, 4]>();
  });

  test("split tuple in to [head, ...tail]", () => {
    type MyTuple = [1, 2, 3, 4];
    type Split = SplitHeadAndTail<MyTuple>;
    expectTypeOf<Split>().toMatchTypeOf<[1, [2, 3, 4]]>();
  });
});
