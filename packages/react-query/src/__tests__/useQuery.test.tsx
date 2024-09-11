import * as React from "react";
import { Stl, z } from "stainless";
import { StainlessReactQueryClient, createUseReactQueryClient } from "..";
import {
  QueryClient,
  QueryClientProvider,
  UseQueryResult,
} from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";

const stl = new Stl({ plugins: {} });

const api = stl.api({
  basePath: "/",
  resources: {
    query: stl.resource({
      summary: "query",
      actions: {
        retrieve: stl.endpoint({
          endpoint: "GET /query/{foo}",
          query: z.object({ bar: z.string() }),
          response: z.any(),
          async handler() {},
        }),
      },
    }),
    optionalQuery: stl.resource({
      summary: "optionalQuery",
      actions: {
        retrieve: stl.endpoint({
          endpoint: "GET /optionalQuery/{foo}",
          query: z.object({ bar: z.string().optional() }),
          response: z.any(),
          async handler() {},
        }),
      },
    }),
    pathQuery: stl.resource({
      summary: "pathQuery",
      actions: {
        retrieve: stl.endpoint({
          endpoint: "GET /pathQuery/{foo}",
          path: z.object({ foo: z.string() }),
          query: z.object({ bar: z.string() }),
          response: z.any(),
          async handler() {},
        }),
      },
    }),
    pathOptionalQuery: stl.resource({
      summary: "pathOptionalQuery",
      actions: {
        retrieve: stl.endpoint({
          endpoint: "GET /pathOptionalQuery/{foo}",
          path: z.object({ foo: z.string() }),
          query: z.object({ bar: z.string().optional() }),
          response: z.any(),
          async handler() {},
        }),
      },
    }),
  },
});

// fetch mock that just echoes back its arguments
const fetch = async (
  req: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  return new Response(JSON.stringify({ req, init }));
};

const queryClient = new QueryClient();

const baseUrl = "http://localhost:3000";

const useClient = createUseReactQueryClient<typeof api>(baseUrl, {
  fetch,
});

describe("useQuery methods", () => {
  for (const [description, useQuery, expectedUrl] of [
    [
      "get with required query",
      (client) => client.query.useRetrieve({ bar: "b" }),
      "/query?bar=b",
    ],
    [
      "get with omitted optional query",
      (client) => client.optionalQuery.useRetrieve(),
      "/optionalQuery",
    ],
    [
      "get with optional query",
      (client) => client.optionalQuery.useRetrieve({ bar: "b" }),
      "/optionalQuery?bar=b",
    ],
    [
      "get with path and required query",
      (client) => client.pathQuery.useRetrieve("a", { bar: "b" }),
      "/pathQuery/a?bar=b",
    ],
    [
      "get with path and optional query",
      (client) => client.pathOptionalQuery.useRetrieve("a", { bar: "b" }),
      "/pathOptionalQuery/a?bar=b",
    ],
    [
      "get with path and omitted optional query",
      (client) => client.pathOptionalQuery.useRetrieve("a"),
      "/pathOptionalQuery/a",
    ],
  ] as [
    string,
    (client: StainlessReactQueryClient<typeof api>) => UseQueryResult<any>,
    string,
  ][]) {
    it(
      description,
      async () => {
        let hookResult: UseQueryResult<any> | undefined;
        const Comp = () => {
          hookResult = useQuery(useClient());
          return null;
        };
        render(
          <QueryClientProvider client={queryClient}>
            <Comp />
          </QueryClientProvider>,
        );
        await waitFor(() => expect(hookResult?.isSuccess).toEqual(true), {
          interval: 500,
          timeout: 10000,
        });
        expect(hookResult?.data?.req).toEqual(`${baseUrl}${expectedUrl}`);
      },
      15000,
    );
  }
});
