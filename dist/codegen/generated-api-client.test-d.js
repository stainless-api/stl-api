"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const api_client_1 = require("../core/api-client");
(0, vitest_1.describe)("Generated API Client", () => {
    (0, vitest_1.describe)("single resource", () => {
        const config = { basePath: "/api" };
        const client = (0, api_client_1.makeClientWithExplicitTypes)(config);
        (0, vitest_1.test)("adds methods for each verb", () => {
            let listOutput = client.cats.list();
            let createOutput = client.cats.create({
                name: "shiro",
                color: "black",
            });
            let retrieveOutput = client.cats("shiro").retrieve();
            let updateOutput = client.cats("shiro").update({ color: "white" });
            let retrieveLitterOutput = client.cats("shiro").litter.retrieveLitter();
            (0, vitest_1.expectTypeOf)(listOutput).toMatchTypeOf();
            (0, vitest_1.expectTypeOf)(createOutput).toMatchTypeOf();
            (0, vitest_1.expectTypeOf)(retrieveOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(updateOutput).toMatchTypeOf();
            (0, vitest_1.expectTypeOf)(retrieveLitterOutput).toEqualTypeOf();
        });
        (0, vitest_1.test)("adds `use${Verb}` aliases", () => {
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
            (0, vitest_1.expectTypeOf)(listOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(createOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(retrieveOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(updateOutput).toEqualTypeOf();
            (0, vitest_1.expectTypeOf)(retrieveLitterOutput).toEqualTypeOf();
        });
    });
    (0, vitest_1.describe)("multiple resource", () => {
        const config = { basePath: "/api" };
        const client = (0, api_client_1.makeClientWithExplicitTypes)(config);
        (0, vitest_1.test)("has a methods for sibling resources", () => {
            let catListOutput = client.cats.list();
            let dogListOutput = client.dogs.list();
            (0, vitest_1.expectTypeOf)(catListOutput).toMatchTypeOf();
            (0, vitest_1.expectTypeOf)(dogListOutput).toEqualTypeOf();
        });
        (0, vitest_1.test)("has a methods for sub resources", () => {
            let dogTreatOutput = client.dogs("fido").dogTreats.list();
            (0, vitest_1.expectTypeOf)(dogTreatOutput).toEqualTypeOf();
        });
    });
    (0, vitest_1.describe)("zod edge cases", () => {
        const config = { basePath: "/api" };
        const client = (0, api_client_1.makeClientWithExplicitTypes)(config);
        (0, vitest_1.test)("can handle native enums", () => {
            (0, vitest_1.expectTypeOf)(client.users("foo").update({}).useSuspenseQuery().data.accountType).toMatchTypeOf();
        });
    });
    (0, vitest_1.describe)("extensions", () => {
        const config = { basePath: "/api" };
        const client = (0, api_client_1.makeClientWithExplicitTypes)(config);
        (0, vitest_1.test)("expects query params", () => {
            (0, vitest_1.expectTypeOf)(client.cats.list({ color: "black" }).useSuspenseQuery).toBeFunction();
        });
    });
});
//# sourceMappingURL=generated-api-client.test-d.js.map