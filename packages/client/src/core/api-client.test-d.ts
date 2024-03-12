import { describe, test } from "vitest";
import { makeClient } from "./api-client";
import { cats } from "../test-util/cat-api";
import { dogs } from "../test-util/dog-api";
import { dogTreats } from "../test-util/dog-treat-api";
import { Stl } from "stainless";

const stl = new Stl({ plugins: {} });

describe("Resource Client", () => {
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
      let updateOutput = client.cats("shiro").update({ color: "white" });
      let retrieveLitterOutput = client
        .cats<"retrieveLitter">("shiro")
        .litter.retrieveLitter();
    });

    test("adds `use${Verb}` aliases", () => {
      let listOutput = client.cats.useList();
      let createOutput = client.cats.useCreate({
        name: "shiro",
        color: "black",
      });
      let retrieveOutput = client.cats<"retrieve">("shiro").useRetrieve();
      let updateOutput = client.cats("shiro").useUpdate({ color: "white" });
      let retrieveLitterOutput = client
        .cats<"retrieveLitter">("shiro")
        .litter.useRetrieveLitter();
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
    });

    test("Allows discriminating between functions using object parameter", () => {
      let retrieveOutput = client
        .cats({ catName: "shiro", discriminator: "retrieve" })
        .retrieve();
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
    });

    test("has a methods for sub resources", () => {
      let dogTreatOutput = client.dogs.dogTreats.get();
    });
  });
});
