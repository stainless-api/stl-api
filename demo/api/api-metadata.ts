import { APIMetadata } from "stainless";

export const api: APIMetadata = {
  "actions": {
    "getOpenapi": {
      "endpoint": "get /api/openapi"
    }
  },
  "namespacedResources": {
    "users": {
      "actions": {
        "list": {
          "endpoint": "get /api/users"
        },
        "retrieve": {
          "endpoint": "get /api/users/{userId}"
        }
      }
    },
    "posts": {
      "actions": {
        "create": {
          "endpoint": "post /api/posts"
        },
        "list": {
          "endpoint": "get /api/posts"
        },
        "retrieve": {
          "endpoint": "get /api/posts/{post}"
        }
      }
    },
    "comments": {
      "actions": {
        "create": {
          "endpoint": "post /api/comments"
        }
      }
    },
    "test": {
      "actions": {
        "foo": {
          "endpoint": "put /api/foo/{value}"
        }
      }
    }
  }
};