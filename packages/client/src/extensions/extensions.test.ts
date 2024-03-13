import {
  MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { cats } from "../test-util/cat-api";
import { dogs } from "../test-util/dog-api";
import { dogTreats } from "../test-util/dog-treat-api";
import { Stl } from "stainless";
import { Client } from "../core/api-client-types";
import { makeClient } from "../core/api-client";
import * as ReactQuery from "@tanstack/react-query";

const stl = new Stl({ plugins: {} });
const api = stl.api({
  basePath: "/api",
  resources: {
    cats,
    dogs,
    dogTreats,
  },
});

type API = typeof api;
type Config = {
  basePath: "/api";
  extensions: { reactQuery: typeof ReactQuery };
};

const mockFetchImplementation = async (
  input: string | URL | Request,
  options?: RequestInit
) => {
  const mockCat = { name: "Shiro", color: "black" };
  let payload;

  switch (`${options?.method} ${input}`) {
    case "GET /api/cats":
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

describe("react-query extension runtime", () => {
  describe("useQuery", () => {
    let client: Client<API, Config>;
    let mockFetch: typeof fetch;
    let mockUseQuery: typeof ReactQuery.useQuery;

    beforeEach(() => {
      mockFetch = vi.fn(mockFetchImplementation);
      mockUseQuery = vi.fn() as typeof ReactQuery.useQuery;

      const config = {
        fetch: mockFetch,
        basePath: "/api" as const,
        extensions: { reactQuery: { ...ReactQuery, useQuery: mockUseQuery } },
      };
      client = makeClient<API, Config>(config);
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
