import { describe, test } from "vitest";
import { makeClient } from "./resource";
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

    type API = typeof api;
    type BasePath = API["basePath"];
    type Resources = API["resources"];

    const client = makeClient<BasePath, Resources>();

    test("adds methods for each verb", () => {
      let listOutput = client.cats.list.api.cats.list();
      let createOutput = client.cats.create.api.cats.create({
        name: "shiro",
        color: "black",
      });
      let retrieveOutput = client.cats.retrieve.api.cats("shiro").retrieve();
      let updateOutput = client.cats.update.api
        .cats("shiro")
        .update({ color: "white" });
      let retrieveLitterOutput = client.cats.retrieveLitter.api
        .cats("shiro")
        .litter.retrieveLitter();
    });

    test("adds `use${Verb}` aliases", () => {
      let listOutput = client.cats.list.api.cats.useList();
      let createOutput = client.cats.create.api.cats.useCreate({
        name: "shiro",
        color: "black",
      });
      let retrieveOutput = client.cats.retrieve.api.cats("shiro").useRetrieve();
      let updateOutput = client.cats.update.api
        .cats("shiro")
        .useUpdate({ color: "white" });
      let retrieveLitterOutput = client.cats.retrieveLitter.api
        .cats("shiro")
        .litter.useRetrieveLitter();
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

    type API = typeof api;
    type BasePath = API["basePath"];
    type Resources = API["resources"];

    const client = makeClient<BasePath, Resources>();

    test("has a copy of methods for all resources", () => {
      let catListOutput = client.cats.list.api.cats.list();
      let dogListOutput = client.dogs.list.api.dogs.list();
      let dogTreatOutput = client.dogTreats.get.api.dogs["dog-treats"].get();
    });
  });
});
