import { APIRouteMap } from "stainless";

export const api: APIRouteMap = {
  "actions": {
    "getOpenapi": {
      "endpoint": "GET /api/openapi"
    }
  },
  "namespacedResources": {
    "test": {
      "actions": {
        "foo": {
          "endpoint": "PUT /api/foo/{value}"
        }
      }
    }
  }
};