import * as React from "react";
import { AnyEndpoint, Stl, z } from "stainless";
import { StainlessReactQueryClient, createUseReactQueryClient } from "..";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import {
  ClientUseMutateFunction,
  ClientUseMutationResult,
} from "../useMutation";

const stl = new Stl({ plugins: {} });

const api = stl.api({
  basePath: "/",
  resources: {
    query: stl.resource({
      summary: "query",
      actions: {
        update: stl.endpoint({
          endpoint: "POST /query/{foo}",
          query: z.object({ bar: z.string() }),
          response: z.any(),
          async handler() {},
        }),
      },
    }),
    optionalQuery: stl.resource({
      summary: "optionalQuery",
      actions: {
        update: stl.endpoint({
          endpoint: "POST /optionalQuery/{foo}",
          query: z.object({ bar: z.string().optional() }),
          response: z.any(),
          async handler() {},
        }),
      },
    }),
    pathQuery: stl.resource({
      summary: "pathQuery",
      actions: {
        update: stl.endpoint({
          endpoint: "POST /pathQuery/{foo}",
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
        update: stl.endpoint({
          endpoint: "POST /pathOptionalQuery/{foo}",
          path: z.object({ foo: z.string() }),
          query: z.object({ bar: z.string().optional() }),
          response: z.any(),
          async handler() {},
        }),
      },
    }),
    body: stl.resource({
      summary: "body",
      actions: {
        update: stl.endpoint({
          endpoint: "POST /body",
          body: z.object({ bar: z.string() }),
          response: z.any(),
          async handler() {},
        }),
      },
    }),
    pathBody: stl.resource({
      summary: "pathBody",
      actions: {
        update: stl.endpoint({
          endpoint: "POST /pathBody/{foo}",
          path: z.object({ foo: z.string() }),
          body: z.object({ bar: z.string() }),
          response: z.any(),
          async handler() {},
        }),
      },
    }),
    queryBody: stl.resource({
      summary: "queryBody",
      actions: {
        update: stl.endpoint({
          endpoint: "POST /queryBody",
          query: z.object({ foo: z.string() }),
          body: z.object({ bar: z.string() }),
          response: z.any(),
          async handler() {},
        }),
      },
    }),
    pathQueryBody: stl.resource({
      summary: "pathQueryBody",
      actions: {
        update: stl.endpoint({
          endpoint: "POST /pathQueryBody/{foo}",
          path: z.object({ foo: z.string() }),
          query: z.object({ baz: z.string() }),
          body: z.object({ bar: z.string() }),
          response: z.any(),
          async handler() {},
        }),
      },
    }),
    optionalQueryBody: stl.resource({
      summary: "optionalQueryBody",
      actions: {
        update: stl.endpoint({
          endpoint: "POST /optionalQueryBody",
          query: z.object({ foo: z.string().optional() }),
          body: z.object({ bar: z.string() }),
          response: z.any(),
          async handler() {},
        }),
      },
    }),
    pathOptionalQueryBody: stl.resource({
      summary: "pathOptionalQueryBody",
      actions: {
        update: stl.endpoint({
          endpoint: "POST /pathOptionalQueryBody/{foo}",
          path: z.object({ foo: z.string() }),
          query: z.object({ baz: z.string().optional() }),
          body: z.object({ bar: z.string() }),
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
  return new Response(
    JSON.stringify({
      req,
      body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
    }),
  );
};

const queryClient = new QueryClient();

const baseUrl = "http://localhost:3000";

const useClient = createUseReactQueryClient<typeof api>(baseUrl, {
  fetch,
});

function testCase<
  E extends AnyEndpoint,
  TData extends { req: string; body?: object },
>(
  description: string,
  useMutation: (
    client: StainlessReactQueryClient<typeof api>,
  ) => ClientUseMutationResult<E, TData>,
  doMutation: (mutate: ClientUseMutateFunction<E, TData>) => void,
  expectedUrl: string,
  expectedBody?: object,
): void {
  it(
    description,
    async () => {
      let hookResult: ClientUseMutationResult<E, TData> | undefined;
      const Comp = () => {
        const result = useMutation(useClient());
        hookResult = result;
        React.useEffect(() => {
          doMutation(result.mutate);
        }, []);
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
      if (expectedBody) {
        expect(hookResult?.data?.body).toEqual(expectedBody);
      }
    },
    15000,
  );
}

describe("useMutation", () => {
  testCase(
    "post with required query",
    (client) => client.query.useUpdate(),
    (update) => update({ query: { bar: "b" } }),
    "/query?bar=b",
  );
  testCase(
    "post with omitted optional query",
    (client) => client.optionalQuery.useUpdate(),
    (update) => update(),
    "/optionalQuery",
  );
  testCase(
    "post with optional query",
    (client) => client.optionalQuery.useUpdate(),
    (update) => update({ query: { bar: "b" } }),
    "/optionalQuery?bar=b",
  );
  testCase(
    "post with path and required query",
    (client) => client.pathQuery.useUpdate(),
    (update) => update("a", { query: { bar: "b" } }),
    "/pathQuery/a?bar=b",
  );
  testCase(
    "post with path and optional query",
    (client) => client.pathOptionalQuery.useUpdate(),
    (update) => update("a", { query: { bar: "b" } }),
    "/pathOptionalQuery/a?bar=b",
  );
  testCase(
    "post with path and omitted optional query",
    (client) => client.pathOptionalQuery.useUpdate(),
    (update) => update("a"),
    "/pathOptionalQuery/a",
  );
  testCase(
    "post with body",
    (client) => client.body.useUpdate(),
    (update) => update({ bar: "a" }),
    "/body",
    { bar: "a" },
  );
  testCase(
    "post with path and body",
    (client) => client.pathBody.useUpdate(),
    (update) => update("a", { bar: "b" }),
    "/pathBody/a",
    { bar: "b" },
  );
  testCase(
    "post with query and body",
    (client) => client.queryBody.useUpdate(),
    (update) => update({ bar: "b" }, { query: { foo: "a" } }),
    "/queryBody?foo=a",
    { bar: "b" },
  );
  testCase(
    "post with path, query and body",
    (client) => client.pathQueryBody.useUpdate(),
    (update) => update("x", { bar: "b" }, { query: { baz: "a" } }),
    "/pathQueryBody/x?baz=a",
    { bar: "b" },
  );
  testCase(
    "post with optional query and body",
    (client) => client.optionalQueryBody.useUpdate(),
    (update) => update({ bar: "b" }, { query: { foo: "a" } }),
    "/optionalQueryBody?foo=a",
    { bar: "b" },
  );
  testCase(
    "post with omitted optional query and body",
    (client) => client.optionalQueryBody.useUpdate(),
    (update) => update({ bar: "b" }),
    "/optionalQueryBody",
    { bar: "b" },
  );
  testCase(
    "post with path, optional query and body",
    (client) => client.pathOptionalQueryBody.useUpdate(),
    (update) => update("x", { bar: "b" }, { query: { baz: "a" } }),
    "/pathOptionalQueryBody/x?baz=a",
    { bar: "b" },
  );
  testCase(
    "post with path, omitted optional query and body",
    (client) => client.pathOptionalQueryBody.useUpdate(),
    (update) => update("x", { bar: "b" }),
    "/pathOptionalQueryBody/x",
    { bar: "b" },
  );
});

it("post with query - onSuccess hook passed to useMutation", async () => {
  const endpoint = api.resources.query.actions.update;
  let onSuccessArgs: any[] | undefined;
  let hookResult: ClientUseMutationResult<typeof endpoint> | undefined;
  const Comp = () => {
    const result = useClient().query.useUpdate({
      onSuccess: (...args) => (onSuccessArgs = args),
    });
    hookResult = result;
    React.useEffect(() => {
      result.mutate({ query: { bar: "a" } });
    }, []);
    return null;
  };
  render(
    <QueryClientProvider client={queryClient}>
      <Comp />
    </QueryClientProvider>,
  );
  await waitFor(
    () => {
      expect(hookResult?.isSuccess).toEqual(true);
      expect(onSuccessArgs).toBeDefined();
    },
    {
      interval: 500,
      timeout: 10000,
    },
  );
  expect(hookResult?.data?.req).toMatchInlineSnapshot(
    `"http://localhost:3000/query?bar=a"`,
  );
  expect(hookResult?.data?.body).toMatchInlineSnapshot(`undefined`);
  expect(onSuccessArgs).toMatchInlineSnapshot(`
    [
      {
        "req": "http://localhost:3000/query?bar=a",
      },
      {
        "args": [
          {
            "query": {
              "bar": "a",
            },
          },
        ],
      },
      undefined,
    ]
  `);
}, 15000);
it("post with query - onSuccess hook passed to mutate fn", async () => {
  const endpoint = api.resources.query.actions.update;
  let onSuccessArgs: any[] | undefined;
  let hookResult: ClientUseMutationResult<typeof endpoint> | undefined;
  const Comp = () => {
    const result = useClient().query.useUpdate();
    hookResult = result;
    React.useEffect(() => {
      result.mutate({
        query: { bar: "a" },
        onSuccess: (...args) => (onSuccessArgs = args),
      });
    }, []);
    return null;
  };
  render(
    <QueryClientProvider client={queryClient}>
      <Comp />
    </QueryClientProvider>,
  );
  await waitFor(
    () => {
      expect(hookResult?.isSuccess).toEqual(true);
      expect(onSuccessArgs).toBeDefined();
    },
    {
      interval: 500,
      timeout: 10000,
    },
  );
  expect(hookResult?.data?.req).toMatchInlineSnapshot(
    `"http://localhost:3000/query?bar=a"`,
  );
  expect(hookResult?.data?.body).toMatchInlineSnapshot(`undefined`);
  expect(onSuccessArgs).toMatchInlineSnapshot(`
    [
      {
        "req": "http://localhost:3000/query?bar=a",
      },
      {
        "args": [
          {
            "query": {
              "bar": "a",
            },
          },
        ],
      },
      undefined,
    ]
  `);
}, 15000);

it("post with path, optional query and body - onSuccess hook passed to useMutation", async () => {
  const endpoint = api.resources.pathOptionalQueryBody.actions.update;
  let onSuccessArgs: any[] | undefined;
  let hookResult: ClientUseMutationResult<typeof endpoint> | undefined;
  const Comp = () => {
    const result = useClient().pathOptionalQueryBody.useUpdate({
      onSuccess: (...args) => (onSuccessArgs = args),
    });
    hookResult = result;
    React.useEffect(() => {
      result.mutate("a", { bar: "b" });
    }, []);
    return null;
  };
  render(
    <QueryClientProvider client={queryClient}>
      <Comp />
    </QueryClientProvider>,
  );
  await waitFor(
    () => {
      expect(hookResult?.isSuccess).toEqual(true);
      expect(onSuccessArgs).toBeDefined();
    },
    {
      interval: 500,
      timeout: 10000,
    },
  );
  expect(hookResult?.data?.req).toMatchInlineSnapshot(
    `"http://localhost:3000/pathOptionalQueryBody/a"`,
  );
  expect(hookResult?.data?.body).toMatchInlineSnapshot(`
    {
      "bar": "b",
    }
  `);
  expect(onSuccessArgs).toMatchInlineSnapshot(`
    [
      {
        "body": {
          "bar": "b",
        },
        "req": "http://localhost:3000/pathOptionalQueryBody/a",
      },
      {
        "args": [
          "a",
          {
            "bar": "b",
          },
        ],
      },
      undefined,
    ]
  `);
}, 15000);

it("post with path, optional query and body - onSuccess hook passed to mutate fn", async () => {
  const endpoint = api.resources.pathOptionalQueryBody.actions.update;
  let onSuccessArgs: any[] | undefined;
  let hookResult: ClientUseMutationResult<typeof endpoint> | undefined;
  const Comp = () => {
    const result = useClient().pathOptionalQueryBody.useUpdate();
    hookResult = result;
    React.useEffect(() => {
      result.mutate(
        "a",
        { bar: "b" },
        {
          onSuccess: (...args) => (onSuccessArgs = args),
        },
      );
    }, []);
    return null;
  };
  render(
    <QueryClientProvider client={queryClient}>
      <Comp />
    </QueryClientProvider>,
  );
  await waitFor(
    () => {
      expect(hookResult?.isSuccess).toEqual(true);
      expect(onSuccessArgs).toBeDefined();
    },
    {
      interval: 500,
      timeout: 10000,
    },
  );
  expect(hookResult?.data?.req).toMatchInlineSnapshot(
    `"http://localhost:3000/pathOptionalQueryBody/a"`,
  );
  expect(hookResult?.data?.body).toMatchInlineSnapshot(`
    {
      "bar": "b",
    }
  `);
  expect(onSuccessArgs).toMatchInlineSnapshot(`
    [
      {
        "body": {
          "bar": "b",
        },
        "req": "http://localhost:3000/pathOptionalQueryBody/a",
      },
      {
        "args": [
          "a",
          {
            "bar": "b",
          },
        ],
      },
      undefined,
    ]
  `);
}, 15000);

it("post with path, query and body - onSuccess hook passed to useMutation", async () => {
  const endpoint = api.resources.pathQueryBody.actions.update;
  let onSuccessArgs: any[] | undefined;
  let hookResult: ClientUseMutationResult<typeof endpoint> | undefined;
  const Comp = () => {
    const result = useClient().pathQueryBody.useUpdate({
      onSuccess: (...args) => (onSuccessArgs = args),
    });
    hookResult = result;
    React.useEffect(() => {
      result.mutate("a", { bar: "b" }, { query: { baz: "c" } });
    }, []);
    return null;
  };
  render(
    <QueryClientProvider client={queryClient}>
      <Comp />
    </QueryClientProvider>,
  );
  await waitFor(
    () => {
      expect(hookResult?.isSuccess).toEqual(true);
      expect(onSuccessArgs).toBeDefined();
    },
    {
      interval: 500,
      timeout: 10000,
    },
  );
  expect(hookResult?.data?.req).toMatchInlineSnapshot(
    `"http://localhost:3000/pathQueryBody/a?baz=c"`,
  );
  expect(hookResult?.data?.body).toMatchInlineSnapshot(`
    {
      "bar": "b",
    }
  `);
  expect(onSuccessArgs).toMatchInlineSnapshot(`
    [
      {
        "body": {
          "bar": "b",
        },
        "req": "http://localhost:3000/pathQueryBody/a?baz=c",
      },
      {
        "args": [
          "a",
          {
            "bar": "b",
          },
          {
            "query": {
              "baz": "c",
            },
          },
        ],
      },
      undefined,
    ]
  `);
}, 15000);
it("post with path, query and body - onSuccess hook passed to mutate fn", async () => {
  const endpoint = api.resources.pathQueryBody.actions.update;
  let onSuccessArgs: any[] | undefined;
  let hookResult: ClientUseMutationResult<typeof endpoint> | undefined;
  const Comp = () => {
    const result = useClient().pathQueryBody.useUpdate();
    hookResult = result;
    React.useEffect(() => {
      result.mutate(
        "a",
        { bar: "b" },
        {
          query: { baz: "c" },
          onSuccess: (...args) => (onSuccessArgs = args),
        },
      );
    }, []);
    return null;
  };
  render(
    <QueryClientProvider client={queryClient}>
      <Comp />
    </QueryClientProvider>,
  );
  await waitFor(
    () => {
      expect(hookResult?.isSuccess).toEqual(true);
      expect(onSuccessArgs).toBeDefined();
    },
    {
      interval: 500,
      timeout: 10000,
    },
  );
  expect(hookResult?.data?.req).toMatchInlineSnapshot(
    `"http://localhost:3000/pathQueryBody/a?baz=c"`,
  );
  expect(hookResult?.data?.body).toMatchInlineSnapshot(`
    {
      "bar": "b",
    }
  `);
  expect(onSuccessArgs).toMatchInlineSnapshot(`
    [
      {
        "body": {
          "bar": "b",
        },
        "req": "http://localhost:3000/pathQueryBody/a?baz=c",
      },
      {
        "args": [
          "a",
          {
            "bar": "b",
          },
          {
            "query": {
              "baz": "c",
            },
          },
        ],
      },
      undefined,
    ]
  `);
}, 15000);

function typeTests() {
  const client = useClient();

  // @ts-expect-error
  client.query.useUpdate().mutate();
  // @ts-expect-error
  client.query.useUpdate().mutate("a");
  // @ts-expect-error
  client.query.useUpdate().mutate({});
  // @ts-expect-error
  client.query.useUpdate().mutate({ query: {} });
  // @ts-expect-error
  client.query.useUpdate().mutate({ query: { bar: 1 } });
  client.query.useUpdate().mutate({ query: { bar: "a" }, onError: () => {} });

  // @ts-expect-error
  client.optionalQuery.useUpdate().mutate("a");
  // @ts-expect-error
  client.optionalQuery.useUpdate().mutate({ query: 1 });
  // @ts-expect-error
  client.optionalQuery.useUpdate().mutate({ query: { bar: 1 } });
  client.optionalQuery.useUpdate().mutate();
  client.optionalQuery.useUpdate().mutate({ query: {} });
  client.optionalQuery
    .useUpdate()
    .mutate({ query: { bar: "a" }, onError: () => {} });

  // @ts-expect-error
  client.pathQuery.useUpdate().mutate();
  // @ts-expect-error
  client.pathQuery.useUpdate().mutate("a");
  // @ts-expect-error
  client.pathQuery.useUpdate().mutate({ query: { bar: "b" } });
  // @ts-expect-error
  client.pathQuery.useUpdate().mutate(1, { query: { bar: "b" } });
  // @ts-expect-error
  client.pathQuery.useUpdate().mutate("a", {});
  // @ts-expect-error
  client.pathQuery.useUpdate().mutate("a", { query: {} });
  // @ts-expect-error
  client.pathQuery.useUpdate().mutate("a", { query: { bar: 1 } });
  client.pathQuery
    .useUpdate()
    .mutate("a", { query: { bar: "b" }, onError: () => {} });

  // @ts-expect-error
  client.pathOptionalQuery.useUpdate().mutate();
  // @ts-expect-error
  client.pathOptionalQuery.useUpdate().mutate(1);
  // @ts-expect-error
  client.pathOptionalQuery.useUpdate().mutate("a", { query: 1 });
  // @ts-expect-error
  client.pathOptionalQuery.useUpdate().mutate("a", { query: { bar: 1 } });
  // @ts-expect-error
  client.pathOptionalQuery.useUpdate().mutate(1, { query: { bar: "a" } });
  client.pathOptionalQuery.useUpdate().mutate("a");
  client.pathOptionalQuery.useUpdate().mutate("a", {});
  client.pathOptionalQuery.useUpdate().mutate("a", { query: {} });
  client.pathOptionalQuery
    .useUpdate()
    .mutate("a", { query: { bar: "b" }, onError: () => {} });

  // @ts-expect-error
  client.body.useUpdate().mutate();
  // @ts-expect-error
  client.body.useUpdate().mutate("a");
  // @ts-expect-error
  client.body.useUpdate().mutate({});
  // @ts-expect-error
  client.body.useUpdate().mutate({ bar: 1 });
  client.body.useUpdate().mutate({ bar: "a" });
  client.body.useUpdate().mutate({ bar: "a" }, { onError: () => {} });

  // @ts-expect-error
  client.pathBody.useUpdate().mutate();
  // @ts-expect-error
  client.pathBody.useUpdate().mutate("a");
  // @ts-expect-error
  client.pathBody.useUpdate().mutate("a", {});
  // @ts-expect-error
  client.pathBody.useUpdate().mutate("a", { bar: 1 });
  // @ts-expect-error
  client.pathBody.useUpdate().mutate(1, { bar: "a" });
  client.pathBody.useUpdate().mutate("a", { bar: "a" });
  client.pathBody.useUpdate().mutate("a", { bar: "a" }, { onError: () => {} });

  // @ts-expect-error
  client.queryBody.useUpdate().mutate();
  // @ts-expect-error
  client.queryBody.useUpdate().mutate(1);
  // @ts-expect-error
  client.queryBody.useUpdate().mutate({ bar: "a" });
  // @ts-expect-error
  client.queryBody.useUpdate().mutate(1, { query: { foo: "a" } });
  // @ts-expect-error
  client.queryBody.useUpdate().mutate("a", { query: { foo: "a" } });
  // @ts-expect-error
  client.queryBody.useUpdate().mutate({ bar: "a" }, {});
  // @ts-expect-error
  client.queryBody.useUpdate().mutate({ bar: "a" }, { query: {} });
  // @ts-expect-error
  client.queryBody.useUpdate().mutate({ bar: "a" }, { query: "a" });
  // @ts-expect-error
  client.queryBody.useUpdate().mutate({ bar: "a" }, { query: { foo: 1 } });
  client.queryBody
    .useUpdate()
    .mutate({ bar: "a" }, { query: { foo: "a" }, onError: () => {} });

  // @ts-expect-error
  client.optionalQueryBody.useUpdate().mutate();
  // @ts-expect-error
  client.optionalQueryBody.useUpdate().mutate(1);
  // @ts-expect-error
  client.optionalQueryBody.useUpdate().mutate({});
  // @ts-expect-error
  client.optionalQueryBody.useUpdate().mutate({ bar: 1 });
  client.optionalQueryBody
    .useUpdate()
    // @ts-expect-error
    .mutate({ bar: "a" }, { query: { bar: 1 } });
  client.optionalQueryBody.useUpdate().mutate({ bar: "a" });
  client.optionalQueryBody.useUpdate().mutate({ bar: "a" }, {});
  client.optionalQueryBody.useUpdate().mutate({ bar: "a" }, { query: {} });
  client.optionalQueryBody
    .useUpdate()
    .mutate({ bar: "a" }, { query: { foo: "b" }, onError: () => {} });

  // @ts-expect-error
  client.pathOptionalQueryBody.useUpdate().mutate();
  // @ts-expect-error
  client.pathOptionalQueryBody.useUpdate().mutate(1);
  // @ts-expect-error
  client.pathOptionalQueryBody.useUpdate().mutate("x");
  // @ts-expect-error
  client.pathOptionalQueryBody.useUpdate().mutate("x", 1);
  // @ts-expect-error
  client.pathOptionalQueryBody.useUpdate().mutate("x", {});
  // @ts-expect-error
  client.pathOptionalQueryBody.useUpdate().mutate("x", { bar: 1 });
  client.pathOptionalQueryBody
    .useUpdate()
    // @ts-expect-error
    .mutate("x", { bar: "a" }, { query: { baz: 1 } });
  // @ts-expect-error
  client.pathOptionalQueryBody.useUpdate().mutate({ blah: 1 }, { bar: "a" });
  // @ts-expect-error
  client.pathOptionalQueryBody.useUpdate().mutate(1, { bar: "a" });
  client.pathOptionalQueryBody.useUpdate().mutate("x", { bar: "a" });
  client.pathOptionalQueryBody.useUpdate().mutate("x", { bar: "a" }, {});
  client.pathOptionalQueryBody
    .useUpdate()
    .mutate("x", { bar: "a" }, { query: {} });
  client.pathOptionalQueryBody
    .useUpdate()
    .mutate("x", { bar: "a" }, { query: { baz: "b" }, onError: () => {} });
}
