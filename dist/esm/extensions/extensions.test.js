import { afterEach, beforeEach, describe, expect, it, vi, } from "vitest";
import { makeClient } from "../core/api-client";
import * as ReactQuery from "@tanstack/react-query";
import * as MockAPI from "../test-util/api-server";
describe("react-query extension runtime", () => {
    describe("useQuery", () => {
        let client;
        let mockFetch;
        let mockUseQuery;
        beforeEach(() => {
            mockFetch = vi.fn(MockAPI.mockFetchImplementation);
            mockUseQuery = vi.fn();
            const config = {
                fetch: mockFetch,
                basePath: "/api",
                extensions: { reactQuery: Object.assign(Object.assign({}, ReactQuery), { useQuery: mockUseQuery }) },
            };
            client = makeClient(config);
        });
        afterEach(() => {
            vi.restoreAllMocks();
        });
        it("Should send the correct queryFn and queryKey", () => {
            client.cats.list.useQuery();
            expect(mockUseQuery).toBeCalledWith({
                queryFn: expect.any(Function),
                queryKey: ["/api/cats/list"],
            });
        });
    });
});
//# sourceMappingURL=extensions.test.js.map