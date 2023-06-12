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
        "comments": {
          "actions": {
            "create": {
              "endpoint": "post /api/comments",
            },
          },
          "namespacedResources": {},
        },
        "posts": {
          "actions": {
            "create": {
              "endpoint": "post /api/posts",
            },
            "list": {
              "endpoint": "get /api/posts",
            },
            "retrieve": {
              "endpoint": "get /api/posts/{post}",
            },
          },
          "namespacedResources": {},
        },
        "users": {
          "actions": {
            "list": {
              "endpoint": "get /api/users",
            },
            "retrieve": {
              "endpoint": "get /api/users/{userId}",
            },
          },
          "namespacedResources": {},
        },
      },
    }
  `);
});
