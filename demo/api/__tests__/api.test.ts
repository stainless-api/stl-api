import { api } from "../api";
import { getApiMetadata } from "stainless";

it("getApiMetadata(api)", () => {
  expect(getApiMetadata(api)).toMatchInlineSnapshot(`
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
