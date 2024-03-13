import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { inferHTTPMethod, makeClient } from "./api-client";
import { cats } from "../test-util/cat-api";
import { dogs } from "../test-util/dog-api";
import { dogTreats } from "../test-util/dog-treat-api";
import { Stl } from "stainless";
import { Client } from "./api-client-types";

const stl = new Stl({ plugins: {} });
const api = stl.api({
  basePath: "/api",
  resources: {
    cats,
    dogs,
    dogTreats,
  },
});

const mockFetchImplementation = async (
  input: string | URL | Request,
  options?: RequestInit
) => {
  const mockCat = { name: "Shiro", color: "black" };
  let payload;

  switch (`${options?.method} ${input}`) {
    case "GET /api/cats":
    case "GET foobar/cats":
      payload = [mockCat];
      break;
    case "PATCH /api/cats/shiro":
      const update = options?.body ? JSON.parse(options.body as any) : {};
      payload = {
        ...mockCat,
        ...update,
      };
      break;
    default:
      payload = {};
  }

  return new Response(JSON.stringify(payload));
};

describe("Inferring method from verb", () => {
  it("defaults to GET requests", () => {
    expect(inferHTTPMethod("foobarbaz")).toEqual("GET");
  });

  it("defaults to GET requests if there is no body", () => {
    expect(inferHTTPMethod("foobarbaz", undefined)).toEqual("GET");
  });

  it("defaults to POST requests if there is a body", () => {
    expect(inferHTTPMethod("foobarbaz", {})).toEqual("POST");
  });

  it("can infer GET requests", () => {
    expect(inferHTTPMethod("get")).toEqual("GET");
    expect(inferHTTPMethod("list")).toEqual("GET");
    expect(inferHTTPMethod("retrieve")).toEqual("GET");
  });

  it("can infer POST requests", () => {
    expect(inferHTTPMethod("post")).toEqual("POST");
    expect(inferHTTPMethod("create")).toEqual("POST");
    expect(inferHTTPMethod("make")).toEqual("POST");
  });

  it("can infer PUT requests", () => {
    expect(inferHTTPMethod("put")).toEqual("PUT");
  });

  it("can infer PATCH requests", () => {
    expect(inferHTTPMethod("patch")).toEqual("PATCH");
    expect(inferHTTPMethod("update")).toEqual("PATCH");
  });

  it("can infer DELETE requests", () => {
    expect(inferHTTPMethod("delete")).toEqual("DELETE");
    expect(inferHTTPMethod("destroy")).toEqual("DELETE");
  });

  it("can infer prefixed requests", () => {
    expect(inferHTTPMethod("useUpdate")).toEqual("PATCH");
  });

  it("can infer suffixed requests", () => {
    expect(inferHTTPMethod("updateAllCats")).toEqual("PATCH");
  });
});

describe("API Client", () => {
  describe("client configuration", () => {
    type API = typeof api;
    let client: Client<API["basePath"], API["resources"]>;
    let mockFetch: typeof fetch;

    beforeEach(() => {
      mockFetch = vi.fn(mockFetchImplementation);
      client = makeClient<API>({ fetch: mockFetch, basePath: "foobar" });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("can have it's base path configured", async () => {
      const cats = await client.cats.list();
      expect(mockFetch).toHaveBeenCalledWith("foobar/cats", { method: "GET" });
      expect(cats).toStrictEqual([{ name: "Shiro", color: "black" }]);
    });
  });

  describe("fetch calls", () => {
    type API = typeof api;
    let client: Client<API["basePath"], API["resources"]>;
    let mockFetch: typeof fetch;

    beforeEach(() => {
      mockFetch = vi.fn(mockFetchImplementation);
      client = makeClient<API>({ fetch: mockFetch });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("can make fetch calls", async () => {
      const cats = await client.cats.list();
      expect(mockFetch).toHaveBeenCalledWith("/api/cats", { method: "GET" });
      expect(cats).toStrictEqual([{ name: "Shiro", color: "black" }]);
    });

    it("can send a request body", async () => {
      const update = await client
        .cats<"update">("shiro")
        .update({ name: "Shiro!" });
      expect(update).toStrictEqual({ name: "Shiro!", color: "black" });
      expect(mockFetch).toHaveBeenCalledWith("/api/cats/shiro", {
        method: "PATCH",
        body: JSON.stringify({ name: "Shiro!" }),
      });
    });
  });

  describe("react hook calls", () => {
    type API = typeof api;
    let client: Client<API["basePath"], API["resources"]>;
    let mockFetch: typeof fetch;

    beforeEach(() => {
      mockFetch = vi.fn(fetch).mockImplementation(mockFetchImplementation);
      client = makeClient<API>({ fetch: mockFetch });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("can make fetch calls", async () => {
      const cats = await client.cats.useList();
      expect(mockFetch).toHaveBeenCalledWith("/api/cats", { method: "GET" });
      expect(cats).toStrictEqual([{ name: "Shiro", color: "black" }]);
    });

    it("can send a request body", async () => {
      const update = await client
        .cats<"update">("shiro")
        .useUpdate({ name: "Shiro!" });
      expect(mockFetch).toHaveBeenCalledWith("/api/cats/shiro", {
        method: "PATCH",
        body: JSON.stringify({ name: "Shiro!" }),
      });
      expect(update).toStrictEqual({ name: "Shiro!", color: "black" });
    });
  });
});
