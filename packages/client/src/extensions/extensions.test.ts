import {
  MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { Client } from "../core/api-client-types";
import { makeClientWithInferredTypes } from "../core/api-client";
import * as ReactQuery from "@tanstack/react-query";
import * as MockAPI from "../test-util/api-server";

type Config = {
  basePath: "/api";
  extensions: { reactQuery: typeof ReactQuery };
};

async function mockUseQueryImplementation({
  queryFn,
}: {
  queryKey: string;
  queryFn: () => any;
}) {
  return await queryFn();
}

describe("react-query extension runtime", () => {
  describe("useQuery", () => {
    let client: Client<MockAPI.API, Config>;
    let mockFetch: typeof fetch;
    let mockUseQuery: typeof ReactQuery.useQuery;

    beforeEach(() => {
      mockFetch = vi.fn(MockAPI.mockFetchImplementation);
      mockUseQuery = vi
        .fn()
        .mockImplementation(
          mockUseQueryImplementation
        ) as typeof ReactQuery.useQuery;

      const config = {
        fetch: mockFetch,
        basePath: "/api" as const,
        extensions: { reactQuery: { ...ReactQuery, useQuery: mockUseQuery } },
      };
      client = makeClientWithInferredTypes<MockAPI.API, Config>(config);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it.skip("Should send the correct queryFn and queryKey", () => {
      client.cats.list({ color: "black" }).useQuery();
      expect(mockUseQuery).toBeCalledWith({
        queryFn: expect.any(Function),
        queryKey: ["/api/cats"],
      });
    });

    it("Should not affect non-extension methods", async () => {
      const cats = client.cats.useList();
      await cats.queryFn();
      expect(mockFetch).toBeCalledWith("/api/cats", { method: "GET" });
    });

    it.skip("Should allow for query params", async () => {
      client.cats.list({ color: "black" }).useQuery();
      expect(mockUseQuery).toBeCalledWith({
        queryFn: expect.any(Function),
        queryKey: ["/api/cats"],
      });
      expect(mockFetch).toBeCalledWith("/api/cats?color=black", {
        method: "GET",
      });
    });
  });
});
