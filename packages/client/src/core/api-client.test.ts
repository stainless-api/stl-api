import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeClient } from "./api-client";
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
  let payload;

  console.log("Mocking fetch to", { endpoint: `${options?.method} ${input}` });

  switch (`${options?.method} ${input}`) {
    case "GET /api/cats":
      payload = [{ name: "Shiro", color: "black" }];
      break;
    default:
      payload = {};
  }

  return new Response(JSON.stringify(payload));
};

describe("API Client", () => {
  describe.only("fetch calls", () => {
    type API = typeof api;
    let client: Client<API["basePath"], API["resources"]>;
    let mockFetch: typeof fetch;

    beforeEach(() => {
      mockFetch = vi.fn(fetch).mockImplementation(mockFetchImplementation);
      client = makeClient<API>({ fetch: mockFetch });
    });

    afterEach(() => {
      vi.restoreAllMocks();
      console.log("=============");
    });

    it("can make fetch calls", async () => {
      const cats = await client.cats.list();
      console.log({ cats });
      expect(mockFetch).toHaveBeenCalledWith("/api/cats", { method: "GET" });
      expect(cats).toStrictEqual([{ name: "Shiro", color: "black" }]);
    });

    it("can make send a request body calls", async () => {
      const update = await client.cats("shiro").update({ name: "Shiro!" });
      expect(mockFetch).toHaveBeenCalledWith("/api/cats/shiro", {
        method: "PATCH",
      });
      expect(update).toStrictEqual({ name: "Shiro", color: "black" });
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
      console.log("=============");
    });

    it("can make fetch calls", async () => {
      const cats = await client.cats.useList();
      console.log({ cats });
      expect(mockFetch).toHaveBeenCalledWith("/api/cats", { method: "GET" });
      expect(cats).toStrictEqual([{ name: "Shiro", color: "black" }]);
    });

    it("can make send a request body calls", async () => {
      const update = await client.cats("shiro").useUpdate({ name: "Shiro!" });
      expect(mockFetch).toHaveBeenCalledWith("/api/cats/shiro", {
        method: "PATCH",
      });
      expect(update).toStrictEqual({ name: "Shiro", color: "black" });
    });
  });
});
