import { APIMetadata } from "stainless";

export const api: APIMetadata = {
  "actions": {
    "getOpenapi": {
      "endpoint": "get /api/openapi"
    }
  },
  "namespacedResources": {
    "test": {
      "actions": {
        "foo": {
          "endpoint": "put /api/foo/{value}"
        }
      }
    }
  }
};