import { describe, expectTypeOf, test } from "vitest";
import type { SplitHeadAndTail, Shift, Filter } from "./tuples";

describe("Tuples", () => {
  test("shift", () => {
    type MyTuple = [1, 2, 3, 4];
    type Shifted = Shift<MyTuple>;
    expectTypeOf<Shifted>().toEqualTypeOf<[2, 3, 4]>();
  });

  test("split tuple in to [head, ...tail]", () => {
    type MyTuple = [1, 2, 3, 4];
    type Split = SplitHeadAndTail<MyTuple>;
    expectTypeOf<Split>().toEqualTypeOf<[1, [2, 3, 4]]>();
  });

  test("filter items out of tuple", () => {
    type MyTuple = [1, 2, 3, 4];
    type Filtered = Filter<MyTuple, 2>;
    expectTypeOf<Filtered>().toEqualTypeOf<[1, 3, 4]>();
  });

  test("filter union out of tuple", () => {
    type MyTuple = [1, 2, 3, 4];
    type Filtered = Filter<MyTuple, 2 | 3>;
    expectTypeOf<Filtered>().toEqualTypeOf<[1, 4]>();
  });

  test("filter types out of tuple", () => {
    type MyTuple = [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }];
    type Filtered = Filter<MyTuple, { value: 3 }>;
    expectTypeOf<Filtered>().toEqualTypeOf<
      [{ value: 1 }, { value: 2 }, { value: 4 }]
    >();
  });
});
