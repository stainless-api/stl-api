import { APIRouteMap } from "stainless";

export const api: APIRouteMap = {
  actions: {
    getOpenapi: {
      endpoint: "get /api/openapi",
    },
  },
  namespacedResources: {
    test: {
      actions: {
        foo: {
          endpoint: "put /api/foo/{value}",
        },
      },
    },
  },
};
