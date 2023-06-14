import { z } from "stainless";
import { stl } from "../libs/stl";
import { users } from "./users";
import { posts } from "./posts";
import { comments } from "./comments";

export const api = stl.api({
  basePath: "/api",
  openapi: {
    endpoint: "get /api/openapi",
  },
  resources: {
    users,
    posts,
    comments,
    test: stl.resource({
      summary: "test",
      internal: false,
      actions: {
        foo: stl.endpoint({
          endpoint: "put /api/foo/{value}",
          path: z.path({
            value: z.coerce.number(z.string()),
          }),
          response: z.response({
            foo: z.number(),
          }),
          handler({ value }) {
            return { foo: value };
          },
        }),
      },
    }),
  },
});
