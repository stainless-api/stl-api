import { describe, expect, it } from "vitest";
import { inferHTTPMethod } from "./api-client";

describe("Inferring HTTP method from verb", () => {
  it("defaults to GET", () => {
    expect(inferHTTPMethod("foobarbaz")).toEqual("GET");
  });

  it("defaults to GET if there is no body", () => {
    expect(inferHTTPMethod("foobarbaz", undefined)).toEqual("GET");
  });

  it("defaults to POST if there is a body", () => {
    expect(inferHTTPMethod("foobarbaz", {})).toEqual("POST");
  });

  it("can infer GET", () => {
    expect(inferHTTPMethod("get")).toEqual("GET");
    expect(inferHTTPMethod("list")).toEqual("GET");
    expect(inferHTTPMethod("retrieve")).toEqual("GET");
  });

  it("can infer POST", () => {
    expect(inferHTTPMethod("post")).toEqual("POST");
    expect(inferHTTPMethod("create")).toEqual("POST");
    expect(inferHTTPMethod("make")).toEqual("POST");
  });

  it("can infer PUT", () => {
    expect(inferHTTPMethod("put")).toEqual("PUT");
  });

  it("can infer PATCH", () => {
    expect(inferHTTPMethod("patch")).toEqual("PATCH");
    expect(inferHTTPMethod("update")).toEqual("PATCH");
  });

  it("can infer DELETE", () => {
    expect(inferHTTPMethod("delete")).toEqual("DELETE");
    expect(inferHTTPMethod("destroy")).toEqual("DELETE");
  });

  it("can infer from prefixed key word", () => {
    expect(inferHTTPMethod("useUpdate")).toEqual("PATCH");
  });

  it("can infer from suffixed key word", () => {
    expect(inferHTTPMethod("updateAllCats")).toEqual("PATCH");
  });
});
