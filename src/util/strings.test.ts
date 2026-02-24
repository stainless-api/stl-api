import { describe, expect, test } from "vitest";
import { kebabCase } from "./strings";

describe("kebabCase", () => {
  test("Basic", () => {
    expect(kebabCase("myPathName")).toBe("my-path-name");
  });

  test("Numbers", () => {
    expect(kebabCase("v0")).toBe("v0");
    expect(kebabCase("version123Path")).toBe("version123-path");
  });
});
