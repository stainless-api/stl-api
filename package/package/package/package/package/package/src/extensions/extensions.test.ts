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
import { makeClient } from "../core/api-client";
import * as ReactQuery from "@tanstack/react-query";
import * as MockAPI from "../test-util/api-server";

type Config = {
  basePath: "/api";
  extensions: { reactQuery: typeof ReactQuery };
};

describe("react-query extension runtime", () => {
  describe("useQuery", () => {
    let client: Client<MockAPI.API, Config>;
    let mockFetch: typeof fetch;
    let mockUseQuery: typeof ReactQuery.useQuery;

    beforeEach(() => {
      mockFetch = vi.fn(MockAPI.mockFetchImplementation);
      mockUseQuery = vi.fn() as typeof ReactQuery.useQuery;

      const config = {
        fetch: mockFetch,
        basePath: "/api" as const,
        extensions: { reactQuery: { ...ReactQuery, useQuery: mockUseQuery } },
      };
      client = makeClient<MockAPI.API, Config>(config);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should send the correct queryFn and queryKey", () => {
      client.cats.list.useQuery();
      expect(mockUseQuery).toBeCalledWith({
        queryFn: expect.any(Function),
        queryKey: ["/api/cats/list"],
      });
    });
  });
});
