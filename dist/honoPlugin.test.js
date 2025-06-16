"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const stainless_1 = require("stainless");
const vitest_1 = require("vitest");
const honoPlugin_1 = require("./honoPlugin");
const stl = new stainless_1.Stl({ plugins: {} });
(0, vitest_1.describe)("basic routing", () => {
    const api = stl.api({
        basePath: "/api",
        resources: {
            posts: stl.resource({
                summary: "posts",
                actions: {
                    retrieve: stl.endpoint({
                        endpoint: "GET /api/posts/:postId",
                        path: stainless_1.z.object({ postId: stainless_1.z.coerce.number() }),
                        query: stainless_1.z.object({ expand: stainless_1.z.string().array().optional() }),
                        response: stainless_1.z.object({ postId: stainless_1.z.coerce.number() }),
                        handler: (params) => params,
                    }),
                    update: stl.endpoint({
                        endpoint: "POST /api/posts/:postId",
                        path: stainless_1.z.object({ postId: stainless_1.z.coerce.number() }),
                        body: stainless_1.z.object({ content: stainless_1.z.string() }),
                        response: stainless_1.z.object({
                            postId: stainless_1.z.coerce.number(),
                            content: stainless_1.z.string(),
                        }),
                        handler: (params) => params,
                    }),
                    list: stl.endpoint({
                        endpoint: "GET /api/posts",
                        response: stainless_1.z.any().array(),
                        handler: () => [],
                    }),
                },
            }),
            comments: stl.resource({
                summary: "comments",
                actions: {
                    retrieve: stl.endpoint({
                        endpoint: "GET /api/comments/:commentId",
                        path: stainless_1.z.object({ commentId: stainless_1.z.coerce.number() }),
                        response: stainless_1.z.object({ commentId: stainless_1.z.coerce.number() }),
                        handler: (params) => params,
                    }),
                    update: stl.endpoint({
                        endpoint: "POST /api/comments/:commentId",
                        path: stainless_1.z.object({ commentId: stainless_1.z.coerce.number() }),
                        handler: () => {
                            throw new stainless_1.UnauthorizedError();
                        },
                    }),
                },
            }),
        },
    });
    const app = new hono_1.Hono();
    app.use("*", (0, honoPlugin_1.stlApi)(api));
    (0, vitest_1.test)("list posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.request("/api/posts");
        (0, vitest_1.expect)(response).toHaveProperty("status", 200);
        (0, vitest_1.expect)(yield response.json()).toMatchInlineSnapshot(`
      []
    `);
    }));
    (0, vitest_1.test)("retrieve posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.request("/api/posts/5");
        (0, vitest_1.expect)(response).toHaveProperty("status", 200);
        (0, vitest_1.expect)(yield response.json()).toMatchInlineSnapshot(`
      {
        "postId": 5,
      }
    `);
    }));
    (0, vitest_1.test)("retrieve posts, wrong method", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.request("/api/posts/5", {
            method: "PUT",
        });
        (0, vitest_1.expect)(response).toHaveProperty("status", 405);
        (0, vitest_1.expect)(yield response.json()).toMatchInlineSnapshot(`
      {
        "message": "No handler for PUT; only GET, POST.",
      }
    `);
    }));
    (0, vitest_1.test)("update posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.request("/api/posts/5", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ content: "hello" }),
        });
        (0, vitest_1.expect)(response).toHaveProperty("status", 200);
        (0, vitest_1.expect)(yield response.json()).toMatchInlineSnapshot(`
      {
        "content": "hello",
        "postId": 5,
      }
    `);
    }));
    (0, vitest_1.test)("update posts, wrong content type", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.request("/api/posts/5", {
            method: "POST",
            headers: {
                "content-type": "text/plain",
            },
            body: "hello",
        });
        (0, vitest_1.expect)(response).toHaveProperty("status", 400);
        (0, vitest_1.expect)(yield response.json()).toMatchInlineSnapshot(`
      {
        "error": "bad request",
        "issues": [
          {
            "code": "invalid_type",
            "expected": "object",
            "message": "Required",
            "path": [
              "<stainless request body>",
            ],
            "received": "undefined",
          },
        ],
      }
    `);
    }));
    (0, vitest_1.test)("retrieve comments", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.request("/api/comments/3");
        (0, vitest_1.expect)(response).toHaveProperty("status", 200);
        (0, vitest_1.expect)(yield response.json()).toMatchInlineSnapshot(`
      {
        "commentId": 3,
      }
    `);
    }));
    (0, vitest_1.test)("not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.request("/api/not-found");
        (0, vitest_1.expect)(response).toHaveProperty("status", 404);
        (0, vitest_1.expect)(yield response.json()).toMatchInlineSnapshot(`
      {
        "error": "not found",
      }
    `);
    }));
    (0, vitest_1.test)("throwing inside handler", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.request("/api/comments/3", {
            method: "POST",
        });
        (0, vitest_1.expect)(response).toHaveProperty("status", 401);
        (0, vitest_1.expect)(yield response.json()).toMatchInlineSnapshot(`
      {
        "error": "unauthorized",
      }
    `);
    }));
});
(0, vitest_1.describe)("hono passthrough", () => {
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
                        body: stainless_1.z.any(),
                        response: stainless_1.z.any(),
                        handler: (body, context) => __awaiter(void 0, void 0, void 0, function* () {
                            const [c] = context.server.args;
                            return { bodyStl: body, bodyRaw: yield c.req.raw.text() };
                        }),
                    }),
                },
            }),
            redirect: stl.resource({
                summary: "redirect",
                actions: {
                    retrieve: stl.endpoint({
                        endpoint: "GET /api/redirect",
                        response: stainless_1.z.any(),
                        handler: (_, context) => {
                            const [c] = context.server.args;
                            return c.redirect("/");
                        },
                    }),
                },
            }),
        },
    });
    const app = new hono_1.Hono();
    app.use("*", (0, honoPlugin_1.stlApi)(baseApi, { handleErrors: false }));
    app.all("/public/*", (c) => {
        return c.text("public content", 200);
    });
    app.notFound((c) => {
        return c.text("custom not found", 404);
    });
    app.onError((err, c) => {
        return c.text(`custom error: ${err.message}`, 500);
    });
    (0, vitest_1.test)("hono response", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.request("/api/redirect");
        (0, vitest_1.expect)(response).toHaveProperty("status", 302);
        (0, vitest_1.expect)(response.headers.get("location")).toMatchInlineSnapshot(`"/"`);
    }));
    (0, vitest_1.test)("public passthrough", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.request("/public/foo/bar");
        (0, vitest_1.expect)(response).toHaveProperty("status", 200);
        (0, vitest_1.expect)(yield response.text()).toMatchInlineSnapshot(`"public content"`);
    }));
    (0, vitest_1.test)("not found passthrough", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.request("/api/comments");
        (0, vitest_1.expect)(response).toHaveProperty("status", 404);
        (0, vitest_1.expect)(yield response.text()).toMatchInlineSnapshot(`"custom not found"`);
    }));
    (0, vitest_1.test)("error passthrough", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.request("/api/posts");
        (0, vitest_1.expect)(response).toHaveProperty("status", 500);
        (0, vitest_1.expect)(yield response.text()).toMatchInlineSnapshot(`"custom error: arbitrary error"`);
    }));
    (0, vitest_1.test)("request passthrough", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.request("/api/posts", {
            method: "POST",
            body: JSON.stringify({ message: "hello" }),
        });
        (0, vitest_1.expect)(response).toHaveProperty("status", 200);
        (0, vitest_1.expect)(yield response.json()).toMatchInlineSnapshot(`
      {
        "bodyRaw": "{"message":"hello"}",
        "bodyStl": {
          "message": "hello",
        },
      }
    `);
    }));
});
//# sourceMappingURL=honoPlugin.test.js.map