import { api } from "../api";
import { getApiRouteMap } from "stainless";

it("getApiRouteMap(api)", () => {
  expect(getApiRouteMap(api)).toMatchInlineSnapshot(`
    {
      "actions": {
        "getOpenapi": {
          "endpoint": "get /api/openapi",
        },
      },
      "namespacedResources": {
        "test": {
          "actions": {
            "foo": {
              "endpoint": "put /api/foo/{value}",
            },
          },
        },
      },
    }
  `);
});
