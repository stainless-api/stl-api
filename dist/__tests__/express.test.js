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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stainless_1 = require("stainless");
const index_1 = require("../index");
const util_1 = require("util");
const port = 7594;
const baseUrl = `http://0.0.0.0:${port}`;
const cleanup = [];
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all(cleanup.map((task) => task()));
    cleanup.length = 0;
}));
function serve(app) {
    return __awaiter(this, void 0, void 0, function* () {
        let server;
        yield (0, util_1.promisify)((cb) => (server = app.listen(port, () => cb(null))))();
        cleanup.push(() => (0, util_1.promisify)((cb) => server.close(cb))());
    });
}
function serveEndpoint(endpoint) {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        (0, index_1.addEndpointRoute)(app, endpoint);
        return yield serve(app);
    });
}
const stl = new stainless_1.Stl({ plugins: {} });
it("context.server", function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield serveEndpoint(stl.endpoint({
            endpoint: "GET /foo",
            response: stainless_1.z.object({
                server: stainless_1.z.object({
                    type: stainless_1.z.string(),
                    argCount: stainless_1.z.number(),
                }),
            }),
            handler: (params, context) => {
                const { server } = context;
                return { server: { type: server.type, argCount: server.args.length } };
            },
        }));
        expect(yield fetch(baseUrl + "/foo").then((r) => r.json()))
            .toMatchInlineSnapshot(`
    {
      "server": {
        "argCount": 2,
        "type": "express",
      },
    }
  `);
    });
});
it("routing and basePathMap", function () {
    return __awaiter(this, void 0, void 0, function* () {
        const router = (0, index_1.apiRouter)(stl.api({
            basePath: "/",
            resources: {
                posts: stl.resource({
                    summary: "posts",
                    actions: {
                        retrieve: stl.endpoint({
                            endpoint: "GET /api/posts/:postId",
                            path: stainless_1.z.object({ postId: stainless_1.z.coerce.number() }),
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
                    },
                }),
            },
        }), { basePathMap: { "/api/": "/" } });
        const app = (0, express_1.default)();
        app.use(router);
        yield serve(app);
        expect(yield fetch(baseUrl + "/posts").then((r) => r.json())).toMatchInlineSnapshot(`[]`);
        expect(yield fetch(baseUrl + "/posts/5").then((r) => r.json()))
            .toMatchInlineSnapshot(`
    {
      "postId": 5,
    }
  `);
        expect(yield fetch(baseUrl + "/posts/5", {
            method: "POST",
            body: JSON.stringify({ content: "foobar" }),
        }).then((r) => r.json())).toMatchInlineSnapshot(`
    {
      "error": "bad request",
      "issues": [
        {
          "code": "invalid_type",
          "expected": "object",
          "message": "Expected object, received string",
          "path": [
            "<stainless request body>",
          ],
          "received": "string",
        },
      ],
    }
  `);
        expect(yield fetch(baseUrl + "/comments/3").then((r) => r.json()))
            .toMatchInlineSnapshot(`
    {
      "commentId": 3,
    }
  `);
        expect(yield fetch(baseUrl + "/posts/5", {
            method: "POST",
            body: JSON.stringify({ content: 1 }),
        })).toHaveProperty("status", 400);
        expect(yield fetch(baseUrl + "/posts/5", {
            method: "DELETE",
        })).toHaveProperty("status", 405);
        expect(yield fetch(baseUrl + "/posts/5/foo", {
            method: "GET",
        })).toHaveProperty("status", 404);
        expect(yield fetch(baseUrl + "/comments/3", {
            method: "POST",
        })).toHaveProperty("status", 405);
    });
});
it("path and query params", function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield serveEndpoint(stl.endpoint({
            endpoint: "GET /posts/:postId/comments/:commentId",
            path: stainless_1.z.object({
                postId: stainless_1.z.coerce.number(),
                commentId: stainless_1.z.coerce.number(),
            }),
            query: stainless_1.z.object({
                expand: stainless_1.z
                    .enum(["user", "user.posts", "user.comments"])
                    .array()
                    .optional(),
            }),
            response: stainless_1.z.object({
                postId: stainless_1.z.number(),
                commentId: stainless_1.z.number(),
                expand: stainless_1.z
                    .enum(["user", "user.posts", "user.comments"])
                    .array()
                    .optional(),
            }),
            handler: (params) => params,
        }));
        expect(yield fetch(baseUrl + "/posts/5/comments/3").then((r) => r.json()))
            .toMatchInlineSnapshot(`
    {
      "commentId": 3,
      "postId": 5,
    }
  `);
        expect(yield fetch(baseUrl +
            `/posts/5/comments/3?expand[0]=user&expand[1]=${encodeURIComponent("user.posts")}`).then((r) => r.json())).toMatchInlineSnapshot(`
    {
      "commentId": 3,
      "expand": [
        "user",
        "user.posts",
      ],
      "postId": 5,
    }
  `);
    });
});
it(`error handling`, function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield serveEndpoint(stl.endpoint({
            endpoint: "GET /foo",
            handler: () => {
                throw new stainless_1.StlError(427, { a: 1, b: 2 });
            },
        }));
        const response = yield fetch(baseUrl + "/foo");
        expect(response).toHaveProperty("status", 427);
        expect(yield response.json()).toMatchInlineSnapshot(`
    {
      "a": 1,
      "b": 2,
    }
  `);
    });
});
it(`handleErrors: false`, function () {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use(express_1.default.text());
        app.use((0, index_1.apiRouter)(stl.api({
            basePath: "/",
            resources: {
                comments: stl.resource({
                    summary: "comments",
                    actions: {
                        retrieve: stl.endpoint({
                            endpoint: "GET /comments/:commentId",
                            path: stainless_1.z.object({ commentId: stainless_1.z.coerce.number() }),
                            handler: () => {
                                throw new Error("this is a test!");
                            },
                        }),
                    },
                }),
            },
        }), { handleErrors: false }));
        let gotErr;
        app.use("/comments/:commentId", (err, req, res, next) => {
            gotErr = err;
            res.status(427).send();
        });
        yield serve(app);
        expect(yield fetch(baseUrl + "/comments/5")).toHaveProperty("status", 427);
        expect(gotErr).toHaveProperty("message", "this is a test!");
    });
});
//# sourceMappingURL=express.test.js.map