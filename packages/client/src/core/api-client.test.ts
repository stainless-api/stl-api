import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeClient } from "./api-client";
import { Client } from "./api-client-types";
import * as MockAPI from "../test-util/api-server";

describe("API Client", () => {
  describe("configuration options", () => {
    let client: Client<MockAPI.API, MockAPI.Config>;
    let mockFetch: typeof fetch;

    beforeEach(() => {
      mockFetch = vi.fn(MockAPI.mockFetchImplementation);
      const config = {
        fetch: mockFetch,
        basePath: "/api" as const,
        urlCase: "camel",
      };
      client = makeClient<MockAPI.API, MockAPI.Config>(config);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("can preserve camel casing", async () => {
      const treat = await client.dogs("fido").dogTreats.get();
      expect(mockFetch).toHaveBeenCalledWith("/api/dogs/fido/dogTreats", {
        method: "GET",
      });
      expect(treat).toStrictEqual({ yummy: true });
    });
  });

  describe("fetch calls", () => {
    let client: Client<MockAPI.API, MockAPI.Config>;
    let mockFetch: typeof fetch;

    beforeEach(() => {
      mockFetch = vi.fn(MockAPI.mockFetchImplementation);
      const config = { fetch: mockFetch, basePath: "/api" as const };
      client = makeClient<MockAPI.API, MockAPI.Config>(config);
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
    let client: Client<MockAPI.API, MockAPI.Config>;
    let mockFetch: typeof fetch;

    beforeEach(() => {
      mockFetch = vi
        .fn(fetch)
        .mockImplementation(MockAPI.mockFetchImplementation);
      const config = { fetch: mockFetch, basePath: "/api" as const };
      client = makeClient<MockAPI.API, MockAPI.Config>(config);
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
