import { api } from "../api";
import { getApiRouteMap } from "stainless";

it("getApiRouteMap(api)", () => {
  expect(getApiRouteMap(api)).toMatchInlineSnapshot(`
    {
      "actions": {
        "getOpenapi": {
          "endpoint": "GET /api/openapi",
        },
      },
      "namespacedResources": {
        "test": {
          "actions": {
            "foo": {
              "endpoint": "PUT /api/foo/{value}",
            },
          },
        },
      },
    }
  `);
});
