import { describe, expectTypeOf, test } from "vitest";
import { Color } from "../test-util/cat-api";
import { Stl } from "stainless";
import { ClientConfig } from "../core/api-client-types";
import { Config } from "./react-query";
import { makeClient } from "../test-util/generated-api-types";

const stl = new Stl({ plugins: {} });

describe("Client extensions", () => {
  describe("react-query", () => {
    const config = {
      basePath: "/api" as const,
      extensions: { reactQuery: {} as Config },
    } satisfies ClientConfig;

    const client = makeClient(config);

    test("adds useQuery method", () => {
      const cats = client.cats.list({ color: "black" }).useQuery();
      expectTypeOf(cats.data).toEqualTypeOf<
        { name: string; color: Color }[] | undefined
      >();
    });

    test("handles query params", () => {
      const cats = client.cats.list({ color: "black" }).useQuery();
      expectTypeOf(cats.data).toEqualTypeOf<
        { name: string; color: Color }[] | undefined
      >();
    });

    test("adds useSuspenseQuery method", () => {
      const cats = client.cats.list({ color: "black" }).useSuspenseQuery();
      expectTypeOf(cats.data).toEqualTypeOf<{ name: string; color: Color }[]>();
    });

    test("adds useMutation method", () => {
      const mutation = client.cats("shiro").update.useMutation();
      expectTypeOf(mutation.mutate).toBeCallableWith({
        name: "string",
        color: "black",
      });
      expectTypeOf(mutation.mutateAsync).toBeCallableWith({
        name: "string",
        color: "blue",
      });
    });

    test("has correct mutation option types", () => {
      expectTypeOf(client.cats("shiro").update.useMutation).toBeCallableWith({
        onSuccess({ name, color }) {
          return { name, color };
        },
      });
    });

    test("adds getQueryKey method", () => {
      const queryKey = client.cats.list.getQueryKey();
      expectTypeOf(queryKey).toEqualTypeOf<string[]>();
    });

    test("keeps non react-query methods", async () => {
      let cats = await client.cats.list();
      expectTypeOf(cats).toEqualTypeOf<{ name: string; color: Color }[]>();

      cats = await client.cats.useList().queryFn();
      expectTypeOf(cats).toEqualTypeOf<{ name: string; color: Color }[]>();
    });
  });
});
