import { stl } from "~/libs/stl";
import z from "zod";
import { Post } from "./models";

export const create = stl.endpoint({
  endpoint: "post /api/posts",
  body: z.object({
    body: z.string(),
  }),
  query: z.object({
    expand: stl.expands(Post, 3).optional(),
  }),
  response: Post,

  async handler({ body }, ctx) {
    return await ctx.prisma.create({
      data: {
        userId: ctx.requireCurrentUser().id,
        body,
      },
    });
  },
});
