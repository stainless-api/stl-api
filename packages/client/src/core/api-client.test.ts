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
    case "GET /api/dogs/fido/dog-treats":
      payload = { yummy: true };
      break;
    case "GET /api/dogs":
      throw new Error("Expected to throw");
    default:
      throw new Error(`Unmocked endpoint: ${options?.method} ${input}`);
  }

  return new Response(JSON.stringify(payload));
};

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

    it("can handle API errors", async () => {
      await expect(async () => await client.dogs.list()).rejects.toThrowError(
        "Expected to throw"
      );
    });

    it("can handle case changes", async () => {
      const treat = await client.dogs("fido").dogTreats.get();
      expect(mockFetch).toHaveBeenCalledWith("/api/dogs/fido/dog-treats", {
        method: "GET",
      });
      expect(treat).toStrictEqual({ yummy: true });
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
      const { queryFn, queryKey } = client.cats.useList();

      expect(queryKey).toEqual(["/api/cats"]);
      expect(queryFn).toBeTypeOf("function");

      const cats = await queryFn();
      expect(mockFetch).toHaveBeenCalledWith("/api/cats", { method: "GET" });
      expect(cats).toStrictEqual([{ name: "Shiro", color: "black" }]);
    });

    it("can send a request body", async () => {
      const { queryFn, queryKey } = client
        .cats<"update">("shiro")
        .useUpdate({ name: "Shiro!" });

      expect(queryKey).toEqual(["/api/cats/shiro"]);
      expect(queryFn).toBeTypeOf("function");

      const update = await queryFn();
      expect(mockFetch).toHaveBeenCalledWith("/api/cats/shiro", {
        method: "PATCH",
        body: JSON.stringify({ name: "Shiro!" }),
      });
      expect(update).toStrictEqual({ name: "Shiro!", color: "black" });
    });
  });
});
