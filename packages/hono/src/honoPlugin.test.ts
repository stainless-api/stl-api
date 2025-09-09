import { Hono } from "hono";
import { Stl, UnauthorizedError, z } from "stainless";
import { describe, expect, test } from "vitest";
import { stlApi } from "./honoPlugin";

const stl = new Stl({ plugins: {} });

describe("basic routing", () => {
  const api = stl.api({
    basePath: "/api",
    resources: {
      posts: stl.resource({
        summary: "posts",
        actions: {
          retrieve: stl.endpoint({
            endpoint: "GET /api/posts/:postId",
            path: z.object({ postId: z.coerce.number() }),
            query: z.object({ expand: z.string().array().optional() }),
            response: z.object({ postId: z.coerce.number() }),
            handler: (params) => params,
          }),
          update: stl.endpoint({
            endpoint: "POST /api/posts/:postId",
            path: z.object({ postId: z.coerce.number() }),
            body: z.object({ content: z.string() }),
            response: z.object({
              postId: z.coerce.number(),
              content: z.string(),
            }),
            handler: (params) => params,
          }),
          list: stl.endpoint({
            endpoint: "GET /api/posts",
            response: z.any().array(),
            handler: () => [],
          }),
        },
      }),
      comments: stl.resource({
        summary: "comments",
        actions: {
          retrieve: stl.endpoint({
            endpoint: "GET /api/comments/:commentId",
            path: z.object({ commentId: z.coerce.number() }),
            response: z.object({ commentId: z.coerce.number() }),
            handler: (params) => params,
          }),
          update: stl.endpoint({
            endpoint: "POST /api/comments/:commentId",
            path: z.object({ commentId: z.coerce.number() }),
            handler: () => {
              throw new UnauthorizedError();
            },
          }),
        },
      }),
    },
  });

  const app = new Hono();
  app.use("*", stlApi(api));

  test("list posts", async () => {
    const response = await app.request("/api/posts");
    expect(response).toHaveProperty("status", 200);
    expect(await response.json()).toMatchInlineSnapshot(`
      []
    `);
  });

  test("retrieve posts", async () => {
    const response = await app.request("/api/posts/5");
    expect(response).toHaveProperty("status", 200);
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "postId": 5,
      }
    `);
  });

  test("retrieve posts, wrong method", async () => {
    const response = await app.request("/api/posts/5", {
      method: "PUT",
    });
    expect(response).toHaveProperty("status", 405);
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "message": "No handler for PUT; only GET, POST.",
      }
    `);
  });

  test("update posts", async () => {
    const response = await app.request("/api/posts/5", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ content: "hello" }),
    });
    expect(response).toHaveProperty("status", 200);
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "content": "hello",
        "postId": 5,
      }
    `);
  });

  test("update posts, wrong content type", async () => {
    const response = await app.request("/api/posts/5", {
      method: "POST",
      headers: {
        "content-type": "text/plain",
      },
      body: "hello",
    });
    expect(response).toHaveProperty("status", 400);
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "error": "bad request",
        "issues": [
          {
            "code": "invalid_type",
            "expected": "object",
            "message": "Required",
            "path": [
              "<body>",
            ],
            "received": "undefined",
          },
        ],
        "message": "Required at "<body>"",
      }
    `);
  });

  test("update posts, missing param", async () => {
    const response = await app.request("/api/posts/5", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    });
    expect(response).toHaveProperty("status", 400);
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "error": "bad request",
        "issues": [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Required",
            "path": [
              "<body>",
              "content",
            ],
            "received": "undefined",
          },
        ],
        "message": "Validation error: Required at "<body>.content"",
      }
    `);
  });

  test("retrieve comments", async () => {
    const response = await app.request("/api/comments/3");
    expect(response).toHaveProperty("status", 200);
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "commentId": 3,
      }
    `);
  });

  test("not found", async () => {
    const response = await app.request("/api/not-found");
    expect(response).toHaveProperty("status", 404);
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "error": "not found",
      }
    `);
  });

  test("throwing inside handler", async () => {
    const response = await app.request("/api/comments/3", {
      method: "POST",
    });
    expect(response).toHaveProperty("status", 401);
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "error": "unauthorized",
      }
    `);
  });
});

describe("hono passthrough", () => {
  const baseApi = stl.api({
    basePath: "/api",
    resources: {
      posts: stl.resource({
        summary: "posts",
        actions: {
          retrieve: stl.endpoint({
            endpoint: "GET /api/posts",
            handler: () => {
              throw new Error("arbitrary error");
            },
          }),
          create: stl.endpoint({
            endpoint: "POST /api/posts",
            body: z.any(),
            response: z.any(),
            handler: async (body, context) => {
              const [c] = context.server.args;
              return { bodyStl: body, bodyRaw: await c.req.raw.text() };
            },
          }),
        },
      }),
      redirect: stl.resource({
        summary: "redirect",
        actions: {
          retrieve: stl.endpoint({
            endpoint: "GET /api/redirect",
            response: z.any() as z.ZodType<Response>,
            handler: (_, context) => {
              const [c] = context.server.args;
              return c.redirect("/");
            },
          }),
        },
      }),
    },
  });

  const app = new Hono();
  app.use("*", stlApi(baseApi, { handleErrors: false }));
  app.all("/public/*", (c) => {
    return c.text("public content", 200);
  });
  app.notFound((c) => {
    return c.text("custom not found", 404);
  });
  app.onError((err, c) => {
    return c.text(`custom error: ${err.message}`, 500);
  });

  test("hono response", async () => {
    const response = await app.request("/api/redirect");
    expect(response).toHaveProperty("status", 302);
    expect(response.headers.get("location")).toMatchInlineSnapshot(`"/"`);
  });

  test("public passthrough", async () => {
    const response = await app.request("/public/foo/bar");
    expect(response).toHaveProperty("status", 200);
    expect(await response.text()).toMatchInlineSnapshot(`"public content"`);
  });

  test("not found passthrough", async () => {
    const response = await app.request("/api/comments");
    expect(response).toHaveProperty("status", 404);
    expect(await response.text()).toMatchInlineSnapshot(`"custom not found"`);
  });

  test("error passthrough", async () => {
    const response = await app.request("/api/posts");
    expect(response).toHaveProperty("status", 500);
    expect(await response.text()).toMatchInlineSnapshot(
      `"custom error: arbitrary error"`
    );
  });

  test("request passthrough", async () => {
    const response = await app.request("/api/posts", {
      method: "POST",
      body: JSON.stringify({ message: "hello" }),
    });
    expect(response).toHaveProperty("status", 200);
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "bodyRaw": "{"message":"hello"}",
        "bodyStl": {
          "message": "hello",
        },
      }
    `);
  });
});
