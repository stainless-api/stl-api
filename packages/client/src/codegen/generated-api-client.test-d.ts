import { describe, expectTypeOf, test } from "vitest";
import { makeClientWithExplicitTypes } from "../core/api-client";
import { Client } from "../test-util/generated-api-types";

describe("Generated API Client", () => {
  describe("single resource", () => {
    const config = { basePath: "/api" as const };
    const client = makeClientWithExplicitTypes<Client>(config);

    test("adds methods for each verb", () => {
      let listOutput = client.cats.list();
      let createOutput = client.cats.create({
        name: "shiro",
        color: "black",
      });
      let retrieveOutput = client.cats("shiro").retrieve();
      let updateOutput = client.cats("shiro").update({ color: "white" });
      let retrieveLitterOutput = client.cats("shiro").litter.retrieveLitter();

      expectTypeOf(listOutput).toEqualTypeOf<
        Promise<{ name: string; color: string }[]>
      >();
      expectTypeOf(createOutput).toEqualTypeOf<
        Promise<{ name: string; color: string }>
      >();
      expectTypeOf(retrieveOutput).toEqualTypeOf<
        Promise<{ name: string; color: string }>
      >();
      expectTypeOf(updateOutput).toEqualTypeOf<
        Promise<{ name: string; color: string }>
      >();
      expectTypeOf(retrieveLitterOutput).toEqualTypeOf<
        Promise<{ name: string; color: string }[]>
      >();
    });

    test("adds `use${Verb}` aliases", () => {
      let listOutput = client.cats.useList();
      let createOutput = client.cats.useCreate({
        name: "shiro",
        color: "black",
      });
      let retrieveOutput = client.cats("shiro").useRetrieve();
      let updateOutput = client.cats("shiro").useUpdate({ color: "white" });
      let retrieveLitterOutput = client
        .cats("shiro")
        .litter.useRetrieveLitter();

      expectTypeOf(listOutput).toEqualTypeOf<{
        queryKey: string[];
        queryFn: () => Promise<{ name: string; color: string }[]>;
      }>();
      expectTypeOf(createOutput).toEqualTypeOf<{
        queryKey: string[];
        queryFn: () => Promise<{ name: string; color: string }>;
      }>();
      expectTypeOf(retrieveOutput).toEqualTypeOf<{
        queryKey: string[];
        queryFn: () => Promise<{ name: string; color: string }>;
      }>();
      expectTypeOf(updateOutput).toEqualTypeOf<{
        queryKey: string[];
        queryFn: () => Promise<{ name: string; color: string }>;
      }>();
      expectTypeOf(retrieveLitterOutput).toEqualTypeOf<{
        queryKey: string[];
        queryFn: () => Promise<{ name: string; color: string }[]>;
      }>();
    });
  });

  describe("multiple resource", () => {
    const config = { basePath: "/api" as const };
    const client = makeClientWithExplicitTypes<Client>(config);

    test("has a methods for sibling resources", () => {
      let catListOutput = client.cats.list();
      let dogListOutput = client.dogs.list();

      expectTypeOf(catListOutput).toEqualTypeOf<
        Promise<{ name: string; color: string }[]>
      >();
      expectTypeOf(dogListOutput).toEqualTypeOf<
        Promise<{ name: string; color: string }[]>
      >();
    });

    test("has a methods for sub resources", () => {
      let dogTreatOutput = client.dogs("fido").dogTreats.list();
      expectTypeOf(dogTreatOutput).toEqualTypeOf<
        Promise<{ yummy: boolean }[]>
      >();
    });
  });

  describe("zod edge cases", () => {
    const config = { basePath: "/api" as const };
    const client = makeClientWithExplicitTypes<Client>(config);

    test("can handle native enums", () => {
      expectTypeOf(
        client.users("foo").update.useSuspenseQuery({}).data.accountType,
      ).toEqualTypeOf<"admin" | "free" | "paid">();
    });
  });
});
