import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeClientWithInferredTypes } from "./api-client";
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
      client = makeClientWithInferredTypes<MockAPI.API, MockAPI.Config>(config);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("can preserve camel casing", async () => {
      const treat = await client.dogs<"list">("fido").dogTreats.list();
      expect(mockFetch).toHaveBeenCalledWith("/api/dogs/fido/dogTreats", {
        method: "GET",
      });
      expect(treat).toStrictEqual([{ yummy: true }]);
    });
  });

  describe("fetch calls", () => {
    let client: Client<MockAPI.API, MockAPI.Config>;
    let mockFetch: typeof fetch;

    beforeEach(() => {
      mockFetch = vi.fn(MockAPI.mockFetchImplementation);
      const config = { fetch: mockFetch, basePath: "/api" as const };
      client = makeClientWithInferredTypes<MockAPI.API, MockAPI.Config>(config);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("can make fetch calls", async () => {
      const cats = await client.cats.list();
      expect(mockFetch).toHaveBeenCalledWith("/api/cats", { method: "GET" });
      expect(cats).toStrictEqual([{ name: "Shiro", color: "black" }]);
    });

    it("can pass query params", async () => {
      const cats = await client.cats.list({ color: "black" });
      expect(mockFetch).toHaveBeenCalledWith("/api/cats?color=black", {
        method: "GET",
      });
      expect(cats).toStrictEqual([{ name: "Shiro", color: "black" }]);
    });

    it("can send a request body", async () => {
      const update = await client
        .cats<"update">("shiro")
        .update({ name: "Shiro!" });
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
        "Expected to throw"
      );
    });

    it("can handle case changes", async () => {
      const treat = await client.dogs<"list">("fido").dogTreats.list();
      expect(mockFetch).toHaveBeenCalledWith("/api/dogs/fido/dog-treats", {
        method: "GET",
      });
      expect(treat).toStrictEqual([{ yummy: true }]);
    });

    it("handles thrown errors", async () => {
      const shouldThrow = client.dogs<'update'>("fido").update({});
      await expect(shouldThrow).rejects.toThrow('Unmocked endpoint: PATCH /api/dogs/fido');
    });


    it("handles error responses", async () => {
      const shouldThrow = client.dogs<'update'>("fido!").update({});
      await expect(shouldThrow).rejects.toThrow('error message');
    })
  });

  describe("`useMethod` style call", () => {
    let client: Client<MockAPI.API, MockAPI.Config>;
    let mockFetch: typeof fetch;

    beforeEach(() => {
      mockFetch = vi
        .fn(fetch)
        .mockImplementation(MockAPI.mockFetchImplementation);
      const config = { fetch: mockFetch, basePath: "/api" as const };
      client = makeClientWithInferredTypes<MockAPI.API, MockAPI.Config>(config);
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

    it("can pass query params", async () => {
      const { queryFn, queryKey } = client.cats.useList({ color: "black" });

      expect(queryKey).toEqual(["/api/cats"]);
      expect(queryFn).toBeTypeOf("function");

      const cats = await queryFn();
      expect(mockFetch).toHaveBeenCalledWith("/api/cats?color=black", {
        method: "GET",
      });
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Shiro!" }),
      });
      expect(update).toStrictEqual({ name: "Shiro!", color: "black" });
    });

    it("Can tell user apart from useX", async () => {
      const { queryFn, queryKey } = client.users("asdf").useUpdate({});

      expect(queryKey).toEqual(["/api/users/asdf"]);
      expect(queryFn).toBeTypeOf("function");
    });
  });
});
