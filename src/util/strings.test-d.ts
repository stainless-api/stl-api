import { describe, expectTypeOf, test } from "vitest";
import type { Replace } from "./strings";

describe("String replacement", () => {
  test("No-op", () => {
    type MyString = "foo-bar-baz";
    type Search = "matt";
    type Replacement = "!";
    type NewString = Replace<MyString, Search, Replacement>;

    expectTypeOf<NewString>().toEqualTypeOf<"foo-bar-baz">();
  });

  test("Match at start", () => {
    type MyString = "foo-bar-baz";
    type Search = "foo";
    type Replacement = "!";
    type NewString = Replace<MyString, Search, Replacement>;

    expectTypeOf<NewString>().toEqualTypeOf<"!-bar-baz">();
  });

  test("Match in middle", () => {
    type MyString = "foo-bar-baz";
    type Search = "bar";
    type Replacement = "!";
    type NewString = Replace<MyString, Search, Replacement>;

    expectTypeOf<NewString>().toEqualTypeOf<"foo-!-baz">();
  });

  test("Match at end", () => {
    type MyString = "foo-bar-baz";
    type Search = "baz";
    type Replacement = "!";
    type NewString = Replace<MyString, Search, Replacement>;

    expectTypeOf<NewString>().toEqualTypeOf<"foo-bar-!">();
  });

  test("Multiple matches", () => {
    type MyString = "foo-foo-foo";
    type Search = "foo";
    type Replacement = "!";
    type NewString = Replace<MyString, Search, Replacement>;

    expectTypeOf<NewString>().toEqualTypeOf<"!-!-!">();
  });

  test("String union search", () => {
    type MyString = "foo-bar-baz";
    type Search = "foo" | "bar" | "baz";
    type Replacement = "!";
    type NewString = Replace<MyString, Search, Replacement>;

    // TODO(someday): unimplemented
    expectTypeOf<NewString>().toBeString();
  });
});
