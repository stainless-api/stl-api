import { describe, expectTypeOf, test } from "vitest";
import { makeClient } from "./api-client";
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

    const client = makeClient<typeof api>();

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
      let retrieveOutput = client.cats<"retrieve">("shiro").useRetrieve();
      let updateOutput = client
        .cats<"update">("shiro")
        .useUpdate({ color: "white" });
      let retrieveLitterOutput = client
        .cats<"retrieveLitter">("shiro")
        .litter.useRetrieveLitter();

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
  });

  describe("Type Hacks and Boilerplate", () => {
    const api = stl.api({
      basePath: "/api",
      resources: {
        cats,
      },
    });

    const client = makeClient<typeof api>();

    test("Allows discriminating between functions using generics", () => {
      let retrieveLitterOutput = client
        .cats<"retrieveLitter">("shiro")
        .litter.retrieveLitter();

      expectTypeOf(retrieveLitterOutput).toEqualTypeOf<
        Promise<{ name: string; color: string }[]>
      >();
    });

    test("Allows discriminating between functions using object parameter", () => {
      let retrieveOutput = client
        .cats({ catName: "shiro", discriminator: "retrieve" })
        .retrieve();

      expectTypeOf(retrieveOutput).toEqualTypeOf<
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

    const client = makeClient<typeof api>();

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
      let dogTreatOutput = client.dogs.dogTreats.get();
      expectTypeOf(dogTreatOutput).toEqualTypeOf<Promise<{ yummy: boolean }>>();
    });
  });
});
