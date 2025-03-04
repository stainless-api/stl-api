import { describe, expectTypeOf, test } from "vitest";
import { makeClientWithInferredTypes } from "./api-client";
import { cats } from "../test-util/cat-api";
import { dogs } from "../test-util/dog-api";
import { dogTreats } from "../test-util/dog-treat-api";
import { Stl } from "stainless";

const stl = new Stl({ plugins: {} });

describe("API Client", () => {
  describe("single resource", () => {
    const api = stl.api({
      basePath: "/api",
      resources: {
        cats,
      },
    });

    const config = { basePath: "/api" as const };
    const client = makeClientWithInferredTypes<typeof api, typeof config>(
      config
    );

    test("adds methods for each verb", () => {
      let listOutput = client.cats.list();
      let createOutput = client.cats.create({
        name: "shiro",
        color: "black",
      });
      let retrieveOutput = client.cats<"retrieve">("shiro").retrieve();
      let updateOutput = client
        .cats<"update">("shiro")
        .update({ color: "white" });
      let retrieveLitterOutput = client
        .cats<"retrieveLitter">("shiro")
        .litter.retrieveLitter();

      expectTypeOf(listOutput).toMatchTypeOf<
        Promise<{ name: string; color: string }[]>
      >();
      expectTypeOf(createOutput).toMatchTypeOf<
        Promise<{ name: string; color: string }>
      >();
      expectTypeOf(retrieveOutput).toMatchTypeOf<
        Promise<{ name: string; color: string }>
      >();
      expectTypeOf(updateOutput).toMatchTypeOf<
        Promise<{ name: string; color: string }>
      >();
      expectTypeOf(retrieveLitterOutput).toMatchTypeOf<
        Promise<{ name: string; color: string }[]>
      >();
    });

    test("adds `use${Verb}` aliases", () => {
      let listOutput = client.cats.useList();
      let createOutput = client.cats.useCreate({
        name: "shiro",
        color: "black",
      });
      let retrieveOutput = client.cats<"retrieve">("shiro").useRetrieve();
      let updateOutput = client
        .cats<"update">("shiro")
        .useUpdate({ color: "white" });
      let retrieveLitterOutput = client
        .cats<"retrieveLitter">("shiro")
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

  describe("Type Hacks and Boilerplate", () => {
    const api = stl.api({
      basePath: "/api",
      resources: {
        cats,
      },
    });

    const config = { basePath: "/api" as const };
    const client = makeClientWithInferredTypes<typeof api, typeof config>(
      config
    );

    test("Allows discriminating between functions using generics", () => {
      let retrieveLitterOutput = client
        .cats<"retrieveLitter">("shiro")
        .litter.retrieveLitter();

      expectTypeOf(retrieveLitterOutput).toMatchTypeOf<
        Promise<{ name: string; color: string }[]>
      >();
    });

    test("Allows discriminating between functions using object parameter", () => {
      let retrieveOutput = client
        .cats({ catName: "shiro", discriminator: "retrieve" })
        .retrieve();

      expectTypeOf(retrieveOutput).toMatchTypeOf<
        Promise<{ name: string; color: string }>
      >();
    });
  });

  describe("multiple resource", () => {
    const api = stl.api({
      basePath: "/api",
      resources: {
        cats,
        dogs,
        dogTreats,
      },
    });

    const config = { basePath: "/api" as const };
    const client = makeClientWithInferredTypes<typeof api, typeof config>(
      config
    );

    test("has a methods for sibling resources", () => {
      let catListOutput = client.cats.list();
      let dogListOutput = client.dogs.list();

      expectTypeOf(catListOutput).toMatchTypeOf<
        Promise<{ name: string; color: string }[]>
      >();
      expectTypeOf(dogListOutput).toMatchTypeOf<
        Promise<{ name: string; color: string }[]>
      >();
    });

    test("has a methods for sub resources", () => {
      let dogTreatOutput = client
        .dogs<"retrieveTreat">("fido")
        .dogTreats("treatId")
        .retrieveTreat();
      expectTypeOf(dogTreatOutput).toMatchTypeOf<Promise<{ yummy: boolean }>>();
    });
  });
});
