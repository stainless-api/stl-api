"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const api_client_1 = require("./api-client");
const cat_api_1 = require("../test-util/cat-api");
const dog_api_1 = require("../test-util/dog-api");
const dog_treat_api_1 = require("../test-util/dog-treat-api");
const stainless_1 = require("stainless");
const stl = new stainless_1.Stl({ plugins: {} });
(0, vitest_1.describe)("API Client", () => {
    (0, vitest_1.describe)("single resource", () => {
        const api = stl.api({
            basePath: "/api",
            resources: {
                cats: cat_api_1.cats,
            },
        });
        const config = { basePath: "/api" };
        const client = (0, api_client_1.makeClient)(config);
        (0, vitest_1.test)("adds methods for each verb", () => {
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
            (0, vitest_1.expectTypeOf)(listOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(createOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(retrieveOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(updateOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(retrieveLitterOutput).toEqualTypeOf();
        });
        (0, vitest_1.test)("adds `use${Verb}` aliases", () => {
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
            (0, vitest_1.expectTypeOf)(listOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(createOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(retrieveOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(updateOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(retrieveLitterOutput).toEqualTypeOf();
        });
    });
    (0, vitest_1.describe)("Type Hacks and Boilerplate", () => {
        const api = stl.api({
            basePath: "/api",
            resources: {
                cats: cat_api_1.cats,
            },
        });
        const config = { basePath: "/api" };
        const client = (0, api_client_1.makeClient)(config);
        (0, vitest_1.test)("Allows discriminating between functions using generics", () => {
            let retrieveLitterOutput = client
                .cats("shiro")
                .litter.retrieveLitter();
            (0, vitest_1.expectTypeOf)(retrieveLitterOutput).toEqualTypeOf();
        });
        (0, vitest_1.test)("Allows discriminating between functions using object parameter", () => {
            let retrieveOutput = client
                .cats({ catName: "shiro", discriminator: "retrieve" })
                .retrieve();
            (0, vitest_1.expectTypeOf)(retrieveOutput).toEqualTypeOf();
        });
    });
    (0, vitest_1.describe)("multiple resource", () => {
        const api = stl.api({
            basePath: "/api",
            resources: {
                cats: cat_api_1.cats,
                dogs: dog_api_1.dogs,
                dogTreats: dog_treat_api_1.dogTreats,
            },
        });
        const config = { basePath: "/api" };
        const client = (0, api_client_1.makeClient)(config);
        (0, vitest_1.test)("has a methods for sibling resources", () => {
            let catListOutput = client.cats.list();
            let dogListOutput = client.dogs.list();
            (0, vitest_1.expectTypeOf)(catListOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(dogListOutput).toEqualTypeOf();
        });
        (0, vitest_1.test)("has a methods for sub resources", () => {
            let dogTreatOutput = client.dogs("fido").dogTreats.get();
            (0, vitest_1.expectTypeOf)(dogTreatOutput).toEqualTypeOf();
        });
    });
});
//# sourceMappingURL=api-client.test-d.js.map