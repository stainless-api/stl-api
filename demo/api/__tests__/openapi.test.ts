import { testClient } from "../testClient";

// @todo: get includable working again!
it.skip("/api/openapi", async function () {
  expect(await testClient.getOpenapi()).toMatchInlineSnapshot(`
    {
      "components": {
        "schemas": {
          "Comment": {
            "properties": {
              "body": {
                "type": "string",
              },
              "createdAt": {
                "type": "string",
              },
              "id": {
                "format": "uuid",
                "type": "string",
              },
              "post": {
                "$ref": "#/components/schemas/Post",
              },
              "postId": {
                "format": "uuid",
                "type": "string",
              },
              "post_fields": {
                "$ref": "#/components/schemas/PostSelection",
              },
              "updatedAt": {
                "type": "string",
              },
              "user": {
                "$ref": "#/components/schemas/User",
              },
              "userId": {
                "format": "uuid",
                "type": "string",
              },
              "user_fields": {
                "$ref": "#/components/schemas/UserSelection",
              },
            },
            "required": [
              "id",
              "body",
              "createdAt",
              "updatedAt",
              "userId",
              "postId",
            ],
            "type": "object",
          },
          "CommentSelection": {
            "properties": {
              "body": {
                "type": "string",
              },
              "createdAt": {
                "type": "string",
              },
              "id": {
                "format": "uuid",
                "type": "string",
              },
              "post": {
                "$ref": "#/components/schemas/Post",
              },
              "postId": {
                "format": "uuid",
                "type": "string",
              },
              "post_fields": {
                "$ref": "#/components/schemas/PostSelection",
              },
              "updatedAt": {
                "type": "string",
              },
              "user": {
                "$ref": "#/components/schemas/User",
              },
              "userId": {
                "format": "uuid",
                "type": "string",
              },
              "user_fields": {
                "$ref": "#/components/schemas/UserSelection",
              },
            },
            "type": "object",
          },
          "Notification": {
            "properties": {
              "body": {
                "type": "string",
              },
              "createdAt": {
                "type": "string",
              },
              "id": {
                "format": "uuid",
                "type": "string",
              },
              "user": {
                "$ref": "#/components/schemas/User",
              },
              "userId": {
                "format": "uuid",
                "type": "string",
              },
              "user_fields": {
                "$ref": "#/components/schemas/UserSelection",
              },
            },
            "required": [
              "id",
              "body",
              "createdAt",
              "userId",
            ],
            "type": "object",
          },
          "NotificationSelection": {
            "properties": {
              "body": {
                "type": "string",
              },
              "createdAt": {
                "type": "string",
              },
              "id": {
                "format": "uuid",
                "type": "string",
              },
              "user": {
                "$ref": "#/components/schemas/User",
              },
              "userId": {
                "format": "uuid",
                "type": "string",
              },
              "user_fields": {
                "$ref": "#/components/schemas/UserSelection",
              },
            },
            "type": "object",
          },
          "Post": {
            "properties": {
              "body": {
                "type": "string",
              },
              "comments": {
                "items": {
                  "$ref": "#/components/schemas/Comment",
                },
                "type": "array",
              },
              "comments_fields": {
                "items": {
                  "$ref": "#/components/schemas/CommentSelection",
                },
                "type": "array",
              },
              "createdAt": {
                "type": "string",
              },
              "id": {
                "format": "uuid",
                "type": "string",
              },
              "image": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "likedIds": {
                "items": {
                  "format": "uuid",
                  "type": "string",
                },
                "type": "array",
              },
              "updatedAt": {
                "type": "string",
              },
              "user": {
                "$ref": "#/components/schemas/User",
              },
              "userId": {
                "format": "uuid",
                "type": "string",
              },
              "user_fields": {
                "$ref": "#/components/schemas/UserSelection",
              },
            },
            "required": [
              "id",
              "body",
              "createdAt",
              "updatedAt",
              "userId",
              "likedIds",
            ],
            "type": "object",
          },
          "PostPage": {
            "properties": {
              "endCursor": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "hasNextPage": {
                "type": "boolean",
              },
              "hasPreviousPage": {
                "type": "boolean",
              },
              "items": {
                "items": {
                  "$ref": "#/components/schemas/Post",
                },
                "type": "array",
              },
              "startCursor": {
                "type": [
                  "string",
                  "null",
                ],
              },
            },
            "required": [
              "startCursor",
              "endCursor",
              "items",
            ],
            "type": "object",
          },
          "PostSelection": {
            "properties": {
              "body": {
                "type": "string",
              },
              "comments": {
                "items": {
                  "$ref": "#/components/schemas/Comment",
                },
                "type": "array",
              },
              "comments_fields": {
                "items": {
                  "$ref": "#/components/schemas/CommentSelection",
                },
                "type": "array",
              },
              "createdAt": {
                "type": "string",
              },
              "id": {
                "format": "uuid",
                "type": "string",
              },
              "image": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "likedIds": {
                "items": {
                  "format": "uuid",
                  "type": "string",
                },
                "type": "array",
              },
              "updatedAt": {
                "type": "string",
              },
              "user": {
                "$ref": "#/components/schemas/User",
              },
              "userId": {
                "format": "uuid",
                "type": "string",
              },
              "user_fields": {
                "$ref": "#/components/schemas/UserSelection",
              },
            },
            "type": "object",
          },
          "User": {
            "properties": {
              "bio": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "comments": {
                "items": {
                  "$ref": "#/components/schemas/Comment",
                },
                "type": "array",
              },
              "comments_fields": {
                "items": {
                  "$ref": "#/components/schemas/CommentSelection",
                },
                "type": "array",
              },
              "coverImage": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "createdAt": {
                "type": "string",
              },
              "email": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "emailVerified": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "followersCount": {
                "type": "number",
              },
              "followingIds": {
                "items": {
                  "format": "uuid",
                  "type": "string",
                },
                "type": "array",
              },
              "hasNotification": {
                "type": [
                  "boolean",
                  "null",
                ],
              },
              "hashedPassword": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "id": {
                "format": "uuid",
                "type": "string",
              },
              "image": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "name": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "notifications": {
                "items": {
                  "$ref": "#/components/schemas/Notification",
                },
                "type": "array",
              },
              "notifications_fields": {
                "items": {
                  "$ref": "#/components/schemas/NotificationSelection",
                },
                "type": "array",
              },
              "posts": {
                "items": {
                  "$ref": "#/components/schemas/Post",
                },
                "type": "array",
              },
              "posts_fields": {
                "items": {
                  "$ref": "#/components/schemas/PostSelection",
                },
                "type": "array",
              },
              "profileImage": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "updatedAt": {
                "type": "string",
              },
              "username": {
                "type": [
                  "string",
                  "null",
                ],
              },
            },
            "required": [
              "id",
              "createdAt",
              "updatedAt",
              "followingIds",
            ],
            "type": "object",
          },
          "UserSelection": {
            "properties": {
              "bio": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "comments": {
                "items": {
                  "$ref": "#/components/schemas/Comment",
                },
                "type": "array",
              },
              "comments_fields": {
                "items": {
                  "$ref": "#/components/schemas/CommentSelection",
                },
                "type": "array",
              },
              "coverImage": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "createdAt": {
                "type": "string",
              },
              "email": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "emailVerified": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "followersCount": {
                "type": "number",
              },
              "followingIds": {
                "items": {
                  "format": "uuid",
                  "type": "string",
                },
                "type": "array",
              },
              "hasNotification": {
                "type": [
                  "boolean",
                  "null",
                ],
              },
              "hashedPassword": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "id": {
                "format": "uuid",
                "type": "string",
              },
              "image": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "name": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "notifications": {
                "items": {
                  "$ref": "#/components/schemas/Notification",
                },
                "type": "array",
              },
              "notifications_fields": {
                "items": {
                  "$ref": "#/components/schemas/NotificationSelection",
                },
                "type": "array",
              },
              "posts": {
                "items": {
                  "$ref": "#/components/schemas/Post",
                },
                "type": "array",
              },
              "posts_fields": {
                "items": {
                  "$ref": "#/components/schemas/PostSelection",
                },
                "type": "array",
              },
              "profileImage": {
                "type": [
                  "string",
                  "null",
                ],
              },
              "updatedAt": {
                "type": "string",
              },
              "username": {
                "type": [
                  "string",
                  "null",
                ],
              },
            },
            "type": "object",
          },
        },
      },
      "info": {
        "title": "My API",
        "version": "1.0.0",
      },
      "openapi": "3.1.0",
      "paths": {
        "/api/comments": {
          "post": {
            "description": "TODO",
            "parameters": [
              {
                "in": "query",
                "name": "postId",
                "required": true,
                "schema": {
                  "type": "string",
                },
              },
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "body": {
                        "type": "string",
                      },
                    },
                    "required": [
                      "body",
                    ],
                    "type": "object",
                  },
                },
              },
            },
            "responses": {
              "200": {
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Comment",
                    },
                  },
                },
                "description": "success",
              },
            },
            "summary": "TODO",
          },
        },
        "/api/foo/{value}": {
          "put": {
            "description": "TODO",
            "parameters": [
              {
                "in": "path",
                "name": "value",
                "required": true,
                "schema": {
                  "type": "number",
                },
              },
            ],
            "requestBody": {
              "content": {
                "application/json": {},
              },
            },
            "responses": {
              "200": {
                "content": {
                  "application/json": {
                    "schema": {
                      "properties": {
                        "foo": {
                          "type": "number",
                        },
                      },
                      "required": [
                        "foo",
                      ],
                      "type": "object",
                    },
                  },
                },
                "description": "success",
              },
            },
            "summary": "TODO",
          },
        },
        "/api/openapi": {
          "get": {
            "description": "TODO",
            "requestBody": {
              "content": {
                "application/json": {},
              },
            },
            "responses": {
              "200": {
                "content": {
                  "application/json": {
                    "schema": {
                      "properties": {},
                      "type": "object",
                    },
                  },
                },
                "description": "success",
              },
            },
            "summary": "TODO",
          },
        },
        "/api/params/{id}": {
          "get": {
            "description": "TODO",
            "parameters": [
              {
                "in": "path",
                "name": "id",
                "required": true,
                "schema": {
                  "type": "number",
                },
              },
              {
                "in": "query",
                "name": "boolean",
                "schema": {
                  "type": "boolean",
                },
              },
              {
                "in": "query",
                "name": "number",
                "schema": {
                  "type": "number",
                },
              },
              {
                "in": "query",
                "name": "string",
                "schema": {
                  "type": "string",
                },
              },
              {
                "in": "query",
                "name": "date",
                "schema": {
                  "type": "string",
                },
              },
            ],
            "requestBody": {
              "content": {
                "application/json": {},
              },
            },
            "responses": {
              "200": {
                "content": {
                  "application/json": {
                    "schema": {
                      "allOf": [
                        {
                          "properties": {
                            "id": {
                              "type": "number",
                            },
                          },
                          "required": [
                            "id",
                          ],
                          "type": "object",
                        },
                        {
                          "properties": {
                            "boolean": {
                              "type": "boolean",
                            },
                            "date": {
                              "type": "string",
                            },
                            "number": {
                              "type": "number",
                            },
                            "string": {
                              "type": "string",
                            },
                          },
                          "type": "object",
                        },
                      ],
                    },
                  },
                },
                "description": "success",
              },
            },
            "summary": "TODO",
          },
        },
        "/api/posts": {
          "get": {
            "description": "TODO",
            "parameters": [
              {
                "in": "query",
                "name": "pageAfter",
                "schema": {
                  "type": "string",
                },
              },
              {
                "in": "query",
                "name": "pageBefore",
                "schema": {
                  "type": "string",
                },
              },
              {
                "in": "query",
                "name": "pageSize",
                "schema": {
                  "default": 20,
                  "exclusiveMinimum": 0,
                  "type": "number",
                },
              },
              {
                "in": "query",
                "name": "sortBy",
                "schema": {
                  "default": "id",
                  "enum": [
                    "id",
                  ],
                  "type": "string",
                },
              },
              {
                "in": "query",
                "name": "sortDirection",
                "schema": {
                  "anyOf": [
                    {
                      "enum": [
                        "asc",
                      ],
                      "type": "string",
                    },
                    {
                      "enum": [
                        "desc",
                      ],
                      "type": "string",
                    },
                  ],
                  "default": "asc",
                },
              },
              {
                "in": "query",
                "name": "userId",
                "schema": {
                  "type": "string",
                },
              },
              {
                "in": "query",
                "name": "include",
                "schema": {
                  "items": {
                    "enum": [
                      "items.user",
                      "items.user.posts",
                      "items.user.posts.user",
                      "items.user.posts.comments",
                      "items.user.posts_fields.user",
                      "items.user.posts_fields.comments",
                      "items.user.comments",
                      "items.user.comments.user",
                      "items.user.comments.post",
                      "items.user.comments_fields.user",
                      "items.user.comments_fields.post",
                      "items.user.notifications",
                      "items.user.notifications.user",
                      "items.user.notifications_fields.user",
                      "items.user_fields.posts",
                      "items.user_fields.posts.user",
                      "items.user_fields.posts.comments",
                      "items.user_fields.posts_fields.user",
                      "items.user_fields.posts_fields.comments",
                      "items.user_fields.comments",
                      "items.user_fields.comments.user",
                      "items.user_fields.comments.post",
                      "items.user_fields.comments_fields.user",
                      "items.user_fields.comments_fields.post",
                      "items.user_fields.notifications",
                      "items.user_fields.notifications.user",
                      "items.user_fields.notifications_fields.user",
                      "items.comments",
                      "items.comments.user",
                      "items.comments.user.posts",
                      "items.comments.user.comments",
                      "items.comments.user.notifications",
                      "items.comments.user_fields.posts",
                      "items.comments.user_fields.comments",
                      "items.comments.user_fields.notifications",
                      "items.comments.post",
                      "items.comments.post.user",
                      "items.comments.post.comments",
                      "items.comments.post_fields.user",
                      "items.comments.post_fields.comments",
                      "items.comments_fields.user",
                      "items.comments_fields.user.posts",
                      "items.comments_fields.user.comments",
                      "items.comments_fields.user.notifications",
                      "items.comments_fields.user_fields.posts",
                      "items.comments_fields.user_fields.comments",
                      "items.comments_fields.user_fields.notifications",
                      "items.comments_fields.post",
                      "items.comments_fields.post.user",
                      "items.comments_fields.post.comments",
                      "items.comments_fields.post_fields.user",
                      "items.comments_fields.post_fields.comments",
                    ],
                    "type": "string",
                  },
                  "type": "array",
                },
              },
              {
                "in": "query",
                "name": "select",
                "schema": {
                  "type": "string",
                },
              },
            ],
            "requestBody": {
              "content": {
                "application/json": {},
              },
            },
            "responses": {
              "200": {
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/PostPage",
                    },
                  },
                },
                "description": "success",
              },
            },
            "summary": "TODO",
          },
          "post": {
            "description": "TODO",
            "parameters": [
              {
                "in": "query",
                "name": "include",
                "schema": {
                  "items": {
                    "enum": [
                      "user",
                      "user.posts",
                      "user.posts.user",
                      "user.posts.user.posts",
                      "user.posts.user.comments",
                      "user.posts.user.notifications",
                      "user.posts.user_fields.posts",
                      "user.posts.user_fields.comments",
                      "user.posts.user_fields.notifications",
                      "user.posts.comments",
                      "user.posts.comments.user",
                      "user.posts.comments.post",
                      "user.posts.comments_fields.user",
                      "user.posts.comments_fields.post",
                      "user.posts_fields.user",
                      "user.posts_fields.user.posts",
                      "user.posts_fields.user.comments",
                      "user.posts_fields.user.notifications",
                      "user.posts_fields.user_fields.posts",
                      "user.posts_fields.user_fields.comments",
                      "user.posts_fields.user_fields.notifications",
                      "user.posts_fields.comments",
                      "user.posts_fields.comments.user",
                      "user.posts_fields.comments.post",
                      "user.posts_fields.comments_fields.user",
                      "user.posts_fields.comments_fields.post",
                      "user.comments",
                      "user.comments.user",
                      "user.comments.user.posts",
                      "user.comments.user.comments",
                      "user.comments.user.notifications",
                      "user.comments.user_fields.posts",
                      "user.comments.user_fields.comments",
                      "user.comments.user_fields.notifications",
                      "user.comments.post",
                      "user.comments.post.user",
                      "user.comments.post.comments",
                      "user.comments.post_fields.user",
                      "user.comments.post_fields.comments",
                      "user.comments_fields.user",
                      "user.comments_fields.user.posts",
                      "user.comments_fields.user.comments",
                      "user.comments_fields.user.notifications",
                      "user.comments_fields.user_fields.posts",
                      "user.comments_fields.user_fields.comments",
                      "user.comments_fields.user_fields.notifications",
                      "user.comments_fields.post",
                      "user.comments_fields.post.user",
                      "user.comments_fields.post.comments",
                      "user.comments_fields.post_fields.user",
                      "user.comments_fields.post_fields.comments",
                      "user.notifications",
                      "user.notifications.user",
                      "user.notifications.user.posts",
                      "user.notifications.user.comments",
                      "user.notifications.user.notifications",
                      "user.notifications.user_fields.posts",
                      "user.notifications.user_fields.comments",
                      "user.notifications.user_fields.notifications",
                      "user.notifications_fields.user",
                      "user.notifications_fields.user.posts",
                      "user.notifications_fields.user.comments",
                      "user.notifications_fields.user.notifications",
                      "user.notifications_fields.user_fields.posts",
                      "user.notifications_fields.user_fields.comments",
                      "user.notifications_fields.user_fields.notifications",
                      "user_fields.posts",
                      "user_fields.posts.user",
                      "user_fields.posts.user.posts",
                      "user_fields.posts.user.comments",
                      "user_fields.posts.user.notifications",
                      "user_fields.posts.user_fields.posts",
                      "user_fields.posts.user_fields.comments",
                      "user_fields.posts.user_fields.notifications",
                      "user_fields.posts.comments",
                      "user_fields.posts.comments.user",
                      "user_fields.posts.comments.post",
                      "user_fields.posts.comments_fields.user",
                      "user_fields.posts.comments_fields.post",
                      "user_fields.posts_fields.user",
                      "user_fields.posts_fields.user.posts",
                      "user_fields.posts_fields.user.comments",
                      "user_fields.posts_fields.user.notifications",
                      "user_fields.posts_fields.user_fields.posts",
                      "user_fields.posts_fields.user_fields.comments",
                      "user_fields.posts_fields.user_fields.notifications",
                      "user_fields.posts_fields.comments",
                      "user_fields.posts_fields.comments.user",
                      "user_fields.posts_fields.comments.post",
                      "user_fields.posts_fields.comments_fields.user",
                      "user_fields.posts_fields.comments_fields.post",
                      "user_fields.comments",
                      "user_fields.comments.user",
                      "user_fields.comments.user.posts",
                      "user_fields.comments.user.comments",
                      "user_fields.comments.user.notifications",
                      "user_fields.comments.user_fields.posts",
                      "user_fields.comments.user_fields.comments",
                      "user_fields.comments.user_fields.notifications",
                      "user_fields.comments.post",
                      "user_fields.comments.post.user",
                      "user_fields.comments.post.comments",
                      "user_fields.comments.post_fields.user",
                      "user_fields.comments.post_fields.comments",
                      "user_fields.comments_fields.user",
                      "user_fields.comments_fields.user.posts",
                      "user_fields.comments_fields.user.comments",
                      "user_fields.comments_fields.user.notifications",
                      "user_fields.comments_fields.user_fields.posts",
                      "user_fields.comments_fields.user_fields.comments",
                      "user_fields.comments_fields.user_fields.notifications",
                      "user_fields.comments_fields.post",
                      "user_fields.comments_fields.post.user",
                      "user_fields.comments_fields.post.comments",
                      "user_fields.comments_fields.post_fields.user",
                      "user_fields.comments_fields.post_fields.comments",
                      "user_fields.notifications",
                      "user_fields.notifications.user",
                      "user_fields.notifications.user.posts",
                      "user_fields.notifications.user.comments",
                      "user_fields.notifications.user.notifications",
                      "user_fields.notifications.user_fields.posts",
                      "user_fields.notifications.user_fields.comments",
                      "user_fields.notifications.user_fields.notifications",
                      "user_fields.notifications_fields.user",
                      "user_fields.notifications_fields.user.posts",
                      "user_fields.notifications_fields.user.comments",
                      "user_fields.notifications_fields.user.notifications",
                      "user_fields.notifications_fields.user_fields.posts",
                      "user_fields.notifications_fields.user_fields.comments",
                      "user_fields.notifications_fields.user_fields.notifications",
                      "comments",
                      "comments.user",
                      "comments.user.posts",
                      "comments.user.posts.user",
                      "comments.user.posts.comments",
                      "comments.user.posts_fields.user",
                      "comments.user.posts_fields.comments",
                      "comments.user.comments",
                      "comments.user.comments.user",
                      "comments.user.comments.post",
                      "comments.user.comments_fields.user",
                      "comments.user.comments_fields.post",
                      "comments.user.notifications",
                      "comments.user.notifications.user",
                      "comments.user.notifications_fields.user",
                      "comments.user_fields.posts",
                      "comments.user_fields.posts.user",
                      "comments.user_fields.posts.comments",
                      "comments.user_fields.posts_fields.user",
                      "comments.user_fields.posts_fields.comments",
                      "comments.user_fields.comments",
                      "comments.user_fields.comments.user",
                      "comments.user_fields.comments.post",
                      "comments.user_fields.comments_fields.user",
                      "comments.user_fields.comments_fields.post",
                      "comments.user_fields.notifications",
                      "comments.user_fields.notifications.user",
                      "comments.user_fields.notifications_fields.user",
                      "comments.post",
                      "comments.post.user",
                      "comments.post.user.posts",
                      "comments.post.user.comments",
                      "comments.post.user.notifications",
                      "comments.post.user_fields.posts",
                      "comments.post.user_fields.comments",
                      "comments.post.user_fields.notifications",
                      "comments.post.comments",
                      "comments.post.comments.user",
                      "comments.post.comments.post",
                      "comments.post.comments_fields.user",
                      "comments.post.comments_fields.post",
                      "comments.post_fields.user",
                      "comments.post_fields.user.posts",
                      "comments.post_fields.user.comments",
                      "comments.post_fields.user.notifications",
                      "comments.post_fields.user_fields.posts",
                      "comments.post_fields.user_fields.comments",
                      "comments.post_fields.user_fields.notifications",
                      "comments.post_fields.comments",
                      "comments.post_fields.comments.user",
                      "comments.post_fields.comments.post",
                      "comments.post_fields.comments_fields.user",
                      "comments.post_fields.comments_fields.post",
                      "comments_fields.user",
                      "comments_fields.user.posts",
                      "comments_fields.user.posts.user",
                      "comments_fields.user.posts.comments",
                      "comments_fields.user.posts_fields.user",
                      "comments_fields.user.posts_fields.comments",
                      "comments_fields.user.comments",
                      "comments_fields.user.comments.user",
                      "comments_fields.user.comments.post",
                      "comments_fields.user.comments_fields.user",
                      "comments_fields.user.comments_fields.post",
                      "comments_fields.user.notifications",
                      "comments_fields.user.notifications.user",
                      "comments_fields.user.notifications_fields.user",
                      "comments_fields.user_fields.posts",
                      "comments_fields.user_fields.posts.user",
                      "comments_fields.user_fields.posts.comments",
                      "comments_fields.user_fields.posts_fields.user",
                      "comments_fields.user_fields.posts_fields.comments",
                      "comments_fields.user_fields.comments",
                      "comments_fields.user_fields.comments.user",
                      "comments_fields.user_fields.comments.post",
                      "comments_fields.user_fields.comments_fields.user",
                      "comments_fields.user_fields.comments_fields.post",
                      "comments_fields.user_fields.notifications",
                      "comments_fields.user_fields.notifications.user",
                      "comments_fields.user_fields.notifications_fields.user",
                      "comments_fields.post",
                      "comments_fields.post.user",
                      "comments_fields.post.user.posts",
                      "comments_fields.post.user.comments",
                      "comments_fields.post.user.notifications",
                      "comments_fields.post.user_fields.posts",
                      "comments_fields.post.user_fields.comments",
                      "comments_fields.post.user_fields.notifications",
                      "comments_fields.post.comments",
                      "comments_fields.post.comments.user",
                      "comments_fields.post.comments.post",
                      "comments_fields.post.comments_fields.user",
                      "comments_fields.post.comments_fields.post",
                      "comments_fields.post_fields.user",
                      "comments_fields.post_fields.user.posts",
                      "comments_fields.post_fields.user.comments",
                      "comments_fields.post_fields.user.notifications",
                      "comments_fields.post_fields.user_fields.posts",
                      "comments_fields.post_fields.user_fields.comments",
                      "comments_fields.post_fields.user_fields.notifications",
                      "comments_fields.post_fields.comments",
                      "comments_fields.post_fields.comments.user",
                      "comments_fields.post_fields.comments.post",
                      "comments_fields.post_fields.comments_fields.user",
                      "comments_fields.post_fields.comments_fields.post",
                    ],
                    "type": "string",
                  },
                  "type": "array",
                },
              },
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "body": {
                        "type": "string",
                      },
                    },
                    "required": [
                      "body",
                    ],
                    "type": "object",
                  },
                },
              },
            },
            "responses": {
              "200": {
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Post",
                    },
                  },
                },
                "description": "success",
              },
            },
            "summary": "TODO",
          },
        },
        "/api/posts/{post}": {
          "get": {
            "description": "TODO",
            "parameters": [
              {
                "in": "path",
                "name": "post",
                "required": true,
                "schema": {
                  "type": "string",
                },
              },
              {
                "in": "query",
                "name": "include",
                "schema": {
                  "items": {
                    "enum": [
                      "user",
                      "user.posts",
                      "user.posts.user",
                      "user.posts.user.posts",
                      "user.posts.user.comments",
                      "user.posts.user.notifications",
                      "user.posts.user_fields.posts",
                      "user.posts.user_fields.comments",
                      "user.posts.user_fields.notifications",
                      "user.posts.comments",
                      "user.posts.comments.user",
                      "user.posts.comments.post",
                      "user.posts.comments_fields.user",
                      "user.posts.comments_fields.post",
                      "user.posts_fields.user",
                      "user.posts_fields.user.posts",
                      "user.posts_fields.user.comments",
                      "user.posts_fields.user.notifications",
                      "user.posts_fields.user_fields.posts",
                      "user.posts_fields.user_fields.comments",
                      "user.posts_fields.user_fields.notifications",
                      "user.posts_fields.comments",
                      "user.posts_fields.comments.user",
                      "user.posts_fields.comments.post",
                      "user.posts_fields.comments_fields.user",
                      "user.posts_fields.comments_fields.post",
                      "user.comments",
                      "user.comments.user",
                      "user.comments.user.posts",
                      "user.comments.user.comments",
                      "user.comments.user.notifications",
                      "user.comments.user_fields.posts",
                      "user.comments.user_fields.comments",
                      "user.comments.user_fields.notifications",
                      "user.comments.post",
                      "user.comments.post.user",
                      "user.comments.post.comments",
                      "user.comments.post_fields.user",
                      "user.comments.post_fields.comments",
                      "user.comments_fields.user",
                      "user.comments_fields.user.posts",
                      "user.comments_fields.user.comments",
                      "user.comments_fields.user.notifications",
                      "user.comments_fields.user_fields.posts",
                      "user.comments_fields.user_fields.comments",
                      "user.comments_fields.user_fields.notifications",
                      "user.comments_fields.post",
                      "user.comments_fields.post.user",
                      "user.comments_fields.post.comments",
                      "user.comments_fields.post_fields.user",
                      "user.comments_fields.post_fields.comments",
                      "user.notifications",
                      "user.notifications.user",
                      "user.notifications.user.posts",
                      "user.notifications.user.comments",
                      "user.notifications.user.notifications",
                      "user.notifications.user_fields.posts",
                      "user.notifications.user_fields.comments",
                      "user.notifications.user_fields.notifications",
                      "user.notifications_fields.user",
                      "user.notifications_fields.user.posts",
                      "user.notifications_fields.user.comments",
                      "user.notifications_fields.user.notifications",
                      "user.notifications_fields.user_fields.posts",
                      "user.notifications_fields.user_fields.comments",
                      "user.notifications_fields.user_fields.notifications",
                      "user_fields.posts",
                      "user_fields.posts.user",
                      "user_fields.posts.user.posts",
                      "user_fields.posts.user.comments",
                      "user_fields.posts.user.notifications",
                      "user_fields.posts.user_fields.posts",
                      "user_fields.posts.user_fields.comments",
                      "user_fields.posts.user_fields.notifications",
                      "user_fields.posts.comments",
                      "user_fields.posts.comments.user",
                      "user_fields.posts.comments.post",
                      "user_fields.posts.comments_fields.user",
                      "user_fields.posts.comments_fields.post",
                      "user_fields.posts_fields.user",
                      "user_fields.posts_fields.user.posts",
                      "user_fields.posts_fields.user.comments",
                      "user_fields.posts_fields.user.notifications",
                      "user_fields.posts_fields.user_fields.posts",
                      "user_fields.posts_fields.user_fields.comments",
                      "user_fields.posts_fields.user_fields.notifications",
                      "user_fields.posts_fields.comments",
                      "user_fields.posts_fields.comments.user",
                      "user_fields.posts_fields.comments.post",
                      "user_fields.posts_fields.comments_fields.user",
                      "user_fields.posts_fields.comments_fields.post",
                      "user_fields.comments",
                      "user_fields.comments.user",
                      "user_fields.comments.user.posts",
                      "user_fields.comments.user.comments",
                      "user_fields.comments.user.notifications",
                      "user_fields.comments.user_fields.posts",
                      "user_fields.comments.user_fields.comments",
                      "user_fields.comments.user_fields.notifications",
                      "user_fields.comments.post",
                      "user_fields.comments.post.user",
                      "user_fields.comments.post.comments",
                      "user_fields.comments.post_fields.user",
                      "user_fields.comments.post_fields.comments",
                      "user_fields.comments_fields.user",
                      "user_fields.comments_fields.user.posts",
                      "user_fields.comments_fields.user.comments",
                      "user_fields.comments_fields.user.notifications",
                      "user_fields.comments_fields.user_fields.posts",
                      "user_fields.comments_fields.user_fields.comments",
                      "user_fields.comments_fields.user_fields.notifications",
                      "user_fields.comments_fields.post",
                      "user_fields.comments_fields.post.user",
                      "user_fields.comments_fields.post.comments",
                      "user_fields.comments_fields.post_fields.user",
                      "user_fields.comments_fields.post_fields.comments",
                      "user_fields.notifications",
                      "user_fields.notifications.user",
                      "user_fields.notifications.user.posts",
                      "user_fields.notifications.user.comments",
                      "user_fields.notifications.user.notifications",
                      "user_fields.notifications.user_fields.posts",
                      "user_fields.notifications.user_fields.comments",
                      "user_fields.notifications.user_fields.notifications",
                      "user_fields.notifications_fields.user",
                      "user_fields.notifications_fields.user.posts",
                      "user_fields.notifications_fields.user.comments",
                      "user_fields.notifications_fields.user.notifications",
                      "user_fields.notifications_fields.user_fields.posts",
                      "user_fields.notifications_fields.user_fields.comments",
                      "user_fields.notifications_fields.user_fields.notifications",
                      "comments",
                      "comments.user",
                      "comments.user.posts",
                      "comments.user.posts.user",
                      "comments.user.posts.comments",
                      "comments.user.posts_fields.user",
                      "comments.user.posts_fields.comments",
                      "comments.user.comments",
                      "comments.user.comments.user",
                      "comments.user.comments.post",
                      "comments.user.comments_fields.user",
                      "comments.user.comments_fields.post",
                      "comments.user.notifications",
                      "comments.user.notifications.user",
                      "comments.user.notifications_fields.user",
                      "comments.user_fields.posts",
                      "comments.user_fields.posts.user",
                      "comments.user_fields.posts.comments",
                      "comments.user_fields.posts_fields.user",
                      "comments.user_fields.posts_fields.comments",
                      "comments.user_fields.comments",
                      "comments.user_fields.comments.user",
                      "comments.user_fields.comments.post",
                      "comments.user_fields.comments_fields.user",
                      "comments.user_fields.comments_fields.post",
                      "comments.user_fields.notifications",
                      "comments.user_fields.notifications.user",
                      "comments.user_fields.notifications_fields.user",
                      "comments.post",
                      "comments.post.user",
                      "comments.post.user.posts",
                      "comments.post.user.comments",
                      "comments.post.user.notifications",
                      "comments.post.user_fields.posts",
                      "comments.post.user_fields.comments",
                      "comments.post.user_fields.notifications",
                      "comments.post.comments",
                      "comments.post.comments.user",
                      "comments.post.comments.post",
                      "comments.post.comments_fields.user",
                      "comments.post.comments_fields.post",
                      "comments.post_fields.user",
                      "comments.post_fields.user.posts",
                      "comments.post_fields.user.comments",
                      "comments.post_fields.user.notifications",
                      "comments.post_fields.user_fields.posts",
                      "comments.post_fields.user_fields.comments",
                      "comments.post_fields.user_fields.notifications",
                      "comments.post_fields.comments",
                      "comments.post_fields.comments.user",
                      "comments.post_fields.comments.post",
                      "comments.post_fields.comments_fields.user",
                      "comments.post_fields.comments_fields.post",
                      "comments_fields.user",
                      "comments_fields.user.posts",
                      "comments_fields.user.posts.user",
                      "comments_fields.user.posts.comments",
                      "comments_fields.user.posts_fields.user",
                      "comments_fields.user.posts_fields.comments",
                      "comments_fields.user.comments",
                      "comments_fields.user.comments.user",
                      "comments_fields.user.comments.post",
                      "comments_fields.user.comments_fields.user",
                      "comments_fields.user.comments_fields.post",
                      "comments_fields.user.notifications",
                      "comments_fields.user.notifications.user",
                      "comments_fields.user.notifications_fields.user",
                      "comments_fields.user_fields.posts",
                      "comments_fields.user_fields.posts.user",
                      "comments_fields.user_fields.posts.comments",
                      "comments_fields.user_fields.posts_fields.user",
                      "comments_fields.user_fields.posts_fields.comments",
                      "comments_fields.user_fields.comments",
                      "comments_fields.user_fields.comments.user",
                      "comments_fields.user_fields.comments.post",
                      "comments_fields.user_fields.comments_fields.user",
                      "comments_fields.user_fields.comments_fields.post",
                      "comments_fields.user_fields.notifications",
                      "comments_fields.user_fields.notifications.user",
                      "comments_fields.user_fields.notifications_fields.user",
                      "comments_fields.post",
                      "comments_fields.post.user",
                      "comments_fields.post.user.posts",
                      "comments_fields.post.user.comments",
                      "comments_fields.post.user.notifications",
                      "comments_fields.post.user_fields.posts",
                      "comments_fields.post.user_fields.comments",
                      "comments_fields.post.user_fields.notifications",
                      "comments_fields.post.comments",
                      "comments_fields.post.comments.user",
                      "comments_fields.post.comments.post",
                      "comments_fields.post.comments_fields.user",
                      "comments_fields.post.comments_fields.post",
                      "comments_fields.post_fields.user",
                      "comments_fields.post_fields.user.posts",
                      "comments_fields.post_fields.user.comments",
                      "comments_fields.post_fields.user.notifications",
                      "comments_fields.post_fields.user_fields.posts",
                      "comments_fields.post_fields.user_fields.comments",
                      "comments_fields.post_fields.user_fields.notifications",
                      "comments_fields.post_fields.comments",
                      "comments_fields.post_fields.comments.user",
                      "comments_fields.post_fields.comments.post",
                      "comments_fields.post_fields.comments_fields.user",
                      "comments_fields.post_fields.comments_fields.post",
                    ],
                    "type": "string",
                  },
                  "type": "array",
                },
              },
              {
                "in": "query",
                "name": "select",
                "schema": {
                  "type": "string",
                },
              },
            ],
            "requestBody": {
              "content": {
                "application/json": {},
              },
            },
            "responses": {
              "200": {
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Post",
                    },
                  },
                },
                "description": "success",
              },
            },
            "summary": "TODO",
          },
        },
        "/api/users": {
          "get": {
            "description": "TODO",
            "parameters": [
              {
                "in": "query",
                "name": "pageAfter",
                "schema": {
                  "type": "string",
                },
              },
              {
                "in": "query",
                "name": "pageBefore",
                "schema": {
                  "type": "string",
                },
              },
              {
                "in": "query",
                "name": "pageSize",
                "schema": {
                  "default": 20,
                  "exclusiveMinimum": 0,
                  "type": "number",
                },
              },
              {
                "in": "query",
                "name": "sortBy",
                "schema": {
                  "default": "createdAt",
                  "enum": [
                    "createdAt",
                  ],
                  "type": "string",
                },
              },
              {
                "in": "query",
                "name": "sortDirection",
                "schema": {
                  "default": "desc",
                  "enum": [
                    "desc",
                  ],
                  "type": "string",
                },
              },
            ],
            "requestBody": {
              "content": {
                "application/json": {},
              },
            },
            "responses": {
              "200": {
                "content": {
                  "application/json": {
                    "schema": {
                      "properties": {
                        "endCursor": {
                          "type": [
                            "string",
                            "null",
                          ],
                        },
                        "hasNextPage": {
                          "type": "boolean",
                        },
                        "hasPreviousPage": {
                          "type": "boolean",
                        },
                        "items": {
                          "items": {
                            "$ref": "#/components/schemas/User",
                          },
                          "type": "array",
                        },
                        "startCursor": {
                          "type": [
                            "string",
                            "null",
                          ],
                        },
                      },
                      "required": [
                        "startCursor",
                        "endCursor",
                        "items",
                      ],
                      "type": "object",
                    },
                  },
                },
                "description": "success",
              },
            },
            "summary": "TODO",
          },
        },
        "/api/users/{userId}": {
          "get": {
            "description": "TODO",
            "parameters": [
              {
                "in": "path",
                "name": "userId",
                "required": true,
                "schema": {
                  "type": "string",
                },
              },
            ],
            "requestBody": {
              "content": {
                "application/json": {},
              },
            },
            "responses": {
              "200": {
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/User",
                    },
                  },
                },
                "description": "success",
              },
            },
            "summary": "TODO",
          },
        },
      },
      "servers": [
        {
          "url": "v1",
        },
      ],
    }
  `);
});
