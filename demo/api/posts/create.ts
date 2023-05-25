import { stl } from "~/libs/stl";
import { z } from "stainless";
import { Post } from "./models";

export const create = stl.endpoint({
  endpoint: "post /api/posts",
  response: Post,

  query: z.query({
    expand: z.expands(Post, 3).optional(),
  }),
  body: z.body({
    body: z.string(),
  }),

  async handler({ body }, ctx) {
    return await ctx.prisma.create({
      data: {
        userId: ctx.requireCurrentUser().id,
        body,
      },
    });
  },
});
