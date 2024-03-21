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
        const config = { basePath: "/api" };
        const client = makeClientWithInferredTypes(config);
        test("adds methods for each verb", () => {
            let listOutput = client.cats.list();
            let createOutput = client.cats.create({
                name: "shiro",
                color: "black",
            });
            let retrieveOutput = client.cats("shiro").retrieve();
            let updateOutput = client
                .cats("shiro")
                .update({ color: "white" });
            let retrieveLitterOutput = client
                .cats("shiro")
                .litter.retrieveLitter();
            expectTypeOf(listOutput).toEqualTypeOf();
            expectTypeOf(createOutput).toEqualTypeOf();
            expectTypeOf(retrieveOutput).toEqualTypeOf();
            expectTypeOf(updateOutput).toEqualTypeOf();
            expectTypeOf(retrieveLitterOutput).toEqualTypeOf();
        });
        test("adds `use${Verb}` aliases", () => {
            let listOutput = client.cats.useList();
            let createOutput = client.cats.useCreate({
                name: "shiro",
                color: "black",
            });
            let retrieveOutput = client.cats("shiro").useRetrieve();
            let updateOutput = client
                .cats("shiro")
                .useUpdate({ color: "white" });
            let retrieveLitterOutput = client
                .cats("shiro")
                .litter.useRetrieveLitter();
            expectTypeOf(listOutput).toEqualTypeOf();
            expectTypeOf(createOutput).toEqualTypeOf();
            expectTypeOf(retrieveOutput).toEqualTypeOf();
            expectTypeOf(updateOutput).toEqualTypeOf();
            expectTypeOf(retrieveLitterOutput).toEqualTypeOf();
        });
    });
    describe("Type Hacks and Boilerplate", () => {
        const api = stl.api({
            basePath: "/api",
            resources: {
                cats,
            },
        });
        const config = { basePath: "/api" };
        const client = makeClientWithInferredTypes(config);
        test("Allows discriminating between functions using generics", () => {
            let retrieveLitterOutput = client
                .cats("shiro")
                .litter.retrieveLitter();
            expectTypeOf(retrieveLitterOutput).toEqualTypeOf();
        });
        test("Allows discriminating between functions using object parameter", () => {
            let retrieveOutput = client
                .cats({ catName: "shiro", discriminator: "retrieve" })
                .retrieve();
            expectTypeOf(retrieveOutput).toEqualTypeOf();
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
        const config = { basePath: "/api" };
        const client = makeClientWithInferredTypes(config);
        test("has a methods for sibling resources", () => {
            let catListOutput = client.cats.list();
            let dogListOutput = client.dogs.list();
            expectTypeOf(catListOutput).toEqualTypeOf();
            expectTypeOf(dogListOutput).toEqualTypeOf();
        });
        test("has a methods for sub resources", () => {
            let dogTreatOutput = client.dogs("fido").dogTreats.get();
            expectTypeOf(dogTreatOutput).toEqualTypeOf();
        });
    });
});
//# sourceMappingURL=api-client.test-d.js.map