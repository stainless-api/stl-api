import { z } from "../stl";
import deepCoerce from "../deepCoerce";

describe("deepCoerce", () => {
  it("ZodMetadata", () => {
    expect(
      deepCoerce(z.date().withMetadata({ foo: "bar" })).parse("2021-03-03")
    ).toEqual(new Date("2021-03-03"));
  });
});
