import express, { Application, NextFunction, Request, Response } from "express";
import { AnyEndpoint, Stl, StlContext, StlError, z } from "stainless";
import { addEndpointRoute, apiRouter } from "../index";
import { promisify } from "util";
import { Server } from "http";

const port = 7594;
const baseUrl = `http://0.0.0.0:${port}`;

const cleanup: (() => any)[] = [];

afterEach(async () => {
  await Promise.all(cleanup.map((task) => task()));
  cleanup.length = 0;
});

async function serve(app: Application) {
  let server: Server;
  await promisify<void>((cb) => (server = app.listen(port, () => cb(null))))();
  cleanup.push(() => promisify<void>((cb) => server.close(cb))());
}

async function serveEndpoint(endpoint: AnyEndpoint) {
  const app = express();
  app.use(express.json());
  addEndpointRoute(app, endpoint);
  return await serve(app);
}

const stl = new Stl({ plugins: {} });

it("context.server", async function () {
  await serveEndpoint(
    stl.endpoint({
      endpoint: "GET /foo",
      response: z.object({
        server: z.object({
          type: z.string(),
          argCount: z.number(),
        }),
      }),
      handler: (params: any, context: StlContext<any>) => {
        const { server } = context;
        return { server: { type: server.type, argCount: server.args.length } };
      },
    }),
  );
  expect(await fetch(baseUrl + "/foo").then((r) => r.json()))
    .toMatchInlineSnapshot(`
    {
      "server": {
        "argCount": 2,
        "type": "express",
      },
    }
  `);
});

it("routing and basePathMap", async function () {
  const router = apiRouter(
    stl.api({
      basePath: "/",
      resources: {
        posts: stl.resource({
          summary: "posts",
          actions: {
            retrieve: stl.endpoint({
              endpoint: "GET /api/posts/:postId",
              path: z.object({ postId: z.coerce.number() }),
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
          },
        }),
      },
    }),
    { basePathMap: { "/api/": "/" } },
  );
  const app = express();
  app.use(router);
  await serve(app);
  expect(
    await fetch(baseUrl + "/posts").then((r) => r.json()),
  ).toMatchInlineSnapshot(`[]`);

  expect(await fetch(baseUrl + "/posts/5").then((r) => r.json()))
    .toMatchInlineSnapshot(`
    {
      "postId": 5,
    }
  `);

  expect(
    await fetch(baseUrl + "/posts/5", {
      method: "POST",
      body: JSON.stringify({ content: "foobar" }),
    }).then((r) => r.json()),
  ).toMatchInlineSnapshot(`
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

  expect(await fetch(baseUrl + "/comments/3").then((r) => r.json()))
    .toMatchInlineSnapshot(`
    {
      "commentId": 3,
    }
  `);

  expect(
    await fetch(baseUrl + "/posts/5", {
      method: "POST",
      body: JSON.stringify({ content: 1 }),
    }),
  ).toHaveProperty("status", 400);

  expect(
    await fetch(baseUrl + "/posts/5", {
      method: "DELETE",
    }),
  ).toHaveProperty("status", 405);

  expect(
    await fetch(baseUrl + "/posts/5/foo", {
      method: "GET",
    }),
  ).toHaveProperty("status", 404);

  expect(
    await fetch(baseUrl + "/comments/3", {
      method: "POST",
    }),
  ).toHaveProperty("status", 405);
});

it("path and query params", async function () {
  await serveEndpoint(
    stl.endpoint({
      endpoint: "GET /posts/:postId/comments/:commentId",
      path: z.object({
        postId: z.coerce.number(),
        commentId: z.coerce.number(),
      }),
      query: z.object({
        expand: z
          .enum(["user", "user.posts", "user.comments"])
          .array()
          .optional(),
      }),
      response: z.object({
        postId: z.number(),
        commentId: z.number(),
        expand: z
          .enum(["user", "user.posts", "user.comments"])
          .array()
          .optional(),
      }),
      handler: (params) => params,
    }),
  );
  expect(await fetch(baseUrl + "/posts/5/comments/3").then((r) => r.json()))
    .toMatchInlineSnapshot(`
    {
      "commentId": 3,
      "postId": 5,
    }
  `);
  expect(
    await fetch(
      baseUrl +
        `/posts/5/comments/3?expand[0]=user&expand[1]=${encodeURIComponent(
          "user.posts",
        )}`,
    ).then((r) => r.json()),
  ).toMatchInlineSnapshot(`
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

it(`error handling`, async function () {
  await serveEndpoint(
    stl.endpoint({
      endpoint: "GET /foo",
      handler: () => {
        throw new StlError(427, { a: 1, b: 2 });
      },
    }),
  );
  const response = await fetch(baseUrl + "/foo");
  expect(response).toHaveProperty("status", 427);
  expect(await response.json()).toMatchInlineSnapshot(`
    {
      "a": 1,
      "b": 2,
    }
  `);
});

it(`handleErrors: false`, async function () {
  const app = express();
  app.use(express.json());
  app.use(express.text());
  app.use(
    apiRouter(
      stl.api({
        basePath: "/",
        resources: {
          comments: stl.resource({
            summary: "comments",
            actions: {
              retrieve: stl.endpoint({
                endpoint: "GET /comments/:commentId",
                path: z.object({ commentId: z.coerce.number() }),
                handler: () => {
                  throw new Error("this is a test!");
                },
              }),
            },
          }),
        },
      }),
      { handleErrors: false },
    ),
  );
  let gotErr;
  app.use(
    "/comments/:commentId",
    (err: any, req: Request, res: Response, next: NextFunction) => {
      gotErr = err;
      res.status(427).send();
    },
  );
  await serve(app);
  expect(await fetch(baseUrl + "/comments/5")).toHaveProperty("status", 427);
  expect(gotErr).toHaveProperty("message", "this is a test!");
});
