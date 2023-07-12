import { stl } from "../../libs/stl";
import { z } from "stainless";
import { PostSchema } from "./models";

export const create = stl.endpoint({
  endpoint: "post /api/posts",
  response: PostSchema,
  config: {
    authenticated: true,
  },
  query: z.query({
    include: z.includes(PostSchema, 3).optional(),
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
