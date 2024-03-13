import { describe, expectTypeOf, test } from "vitest";
import { cats } from "../test-util/cat-api";
import { dogs } from "../test-util/dog-api";
import { dogTreats } from "../test-util/dog-treat-api";
import { Stl } from "stainless";
import { makeClient } from "../core/api-client";
import { ClientConfig } from "../core/api-client-types";
import { ReactQueryInstance } from "./react-query";

const stl = new Stl({ plugins: {} });

describe("Client extensions", () => {
  describe("react-query", () => {
    const api = stl.api({
      basePath: "/api",
      resources: {
        cats,
        dogs,
        dogTreats,
      },
    });

    const config = {
      basePath: "/api" as const,
      extensions: { reactQuery: {} as ReactQueryInstance },
    } satisfies ClientConfig;
    const client = makeClient<typeof api, typeof config>(config);

    test("adds useQuery method", () => {
      const cats = client.cats.list.useQuery();
      expectTypeOf(cats.data).toEqualTypeOf<
        { name: string; color: string }[] | undefined
      >();
    });

    test("adds useSuspenseQuery method", () => {
      const cats = client.cats.list.useSuspenseQuery();
      expectTypeOf(cats.data).toEqualTypeOf<
        { name: string; color: string }[]
      >();
    });

    test("adds useMutation method", () => {
      const mutation = client.cats("shiro").update.useMutation();
      expectTypeOf(mutation.mutate).toBeCallableWith({
        name: "string",
        color: "string",
      });
      expectTypeOf(mutation.mutateAsync).toBeCallableWith({
        name: "string",
        color: "string",
      });
    });

    test("adds getQueryKey method", () => {
      const queryKey = client.cats.list.getQueryKey();
      expectTypeOf(queryKey).toEqualTypeOf<string>();
    });

    test("keeps non react-query methods", async () => {
      let cats = await client.cats.list();
      expectTypeOf(cats).toEqualTypeOf<{ name: string; color: string }[]>();

      cats = await client.cats.useList().queryFn();
      expectTypeOf(cats).toEqualTypeOf<{ name: string; color: string }[]>();
    });
  });
});
