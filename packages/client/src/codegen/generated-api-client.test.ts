import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeClientWithExplicitTypes } from "../core/api-client";
import * as MockAPI from "../test-util/api-server";
import { Client } from "../test-util/generated-api-types";

describe("Generated API Client", () => {
  describe("configuration options", () => {
    let client: Client;
    let mockFetch: typeof fetch;

    beforeEach(() => {
      mockFetch = vi.fn(MockAPI.mockFetchImplementation);
      const config = {
        fetch: mockFetch,
        basePath: "/api" as const,
        urlCase: "camel" as const,
      };
      client = makeClientWithExplicitTypes<Client>(config);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("can preserve camel casing", async () => {
      const treat = await client
        .dogs("fido")
        .dogTreats("treatId")
        .retrieveTreat();
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dogs/fido/dogTreats/treatId",
        {
          method: "GET",
        },
      );
      expect(treat).toStrictEqual({ yummy: true });
    });
  });

  describe("fetch calls", () => {
    let client: Client;
    let mockFetch: typeof fetch;

    beforeEach(() => {
      mockFetch = vi.fn(MockAPI.mockFetchImplementation);
      const config = { fetch: mockFetch, basePath: "/api" as const };
      client = makeClientWithExplicitTypes<Client>(config);
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
      const update = await client.cats("shiro").update({ name: "Shiro!" });
      expect(update).toStrictEqual({ name: "Shiro!", color: "black" });
      expect(mockFetch).toHaveBeenCalledWith("/api/cats/shiro", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Shiro!" }),
      });
    });

    it("can handle API errors", async () => {
      await expect(async () => await client.dogs.list()).rejects.toThrowError(
        "Expected to throw",
      );
    });

    it("can handle case changes", async () => {
      const treat = await client.dogs("fido").dogTreats.list();
      expect(mockFetch).toHaveBeenCalledWith("/api/dogs/fido/dog-treats", {
        method: "GET",
      });
      expect(treat).toStrictEqual([{ yummy: true }]);
    });
  });

  describe("react hook calls", () => {
    let client: Client;
    let mockFetch: typeof fetch;

    beforeEach(() => {
      mockFetch = vi
        .fn(fetch)
        .mockImplementation(MockAPI.mockFetchImplementation);
      const config = { fetch: mockFetch, basePath: "/api" as const };
      client = makeClientWithExplicitTypes<Client>(config);
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
        .cats("shiro")
        .useUpdate({ name: "Shiro!" });

      expect(queryKey).toEqual(["/api/cats/shiro"]);
      expect(queryFn).toBeTypeOf("function");

      const update = await queryFn();
      expect(mockFetch).toHaveBeenCalledWith("/api/cats/shiro", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Shiro!" }),
      });
      expect(update).toStrictEqual({ name: "Shiro!", color: "black" });
    });

    it("can handle overlapping path params at multi-level depth", async () => {
      const treat = await client
        .dogs("fido")
        .dogTreats("treatId")
        .retrieveTreat();
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dogs/fido/dog-treats/treatId",
        {
          method: "GET",
        },
      );
      expect(treat).toStrictEqual({ yummy: true });

      const treats = await client.dogs("fido").dogTreats.list();
      expect(mockFetch).toHaveBeenCalledWith("/api/dogs/fido/dog-treats", {
        method: "GET",
      });
      expect(treats).toStrictEqual([{ yummy: true }]);

      const update = await client
        .dogs("fido")
        .dogTreats("treatId")
        .update({ yummy: false });
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dogs/fido/dog-treats/treatId",
        {
          body: '{"yummy":false}',
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      expect(update).toStrictEqual({ yummy: false });
    });
  });
});
