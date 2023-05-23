import { z } from "stainless";
import prisma from "~/libs/prismadb";
import { stl } from "~/libs/stl";
import { Post } from "./models";

const response = stl.pageResponse(Post, {
  prismaModel: prisma.post,
});

export const list = stl.endpoint({
  endpoint: "get /api/posts",
  query: stl.PaginationParams.extend({
    sortBy: z.enum(["id"]).default("id"),
    userId: z.string().optional(),
    expand: stl.expands(response, 3).optional(),
    select: stl.selects(response, 3).optional(),
  }),
  response,
  async handler({ userId, expand, ...params }, ctx) {
    if (userId && typeof userId === "string") {
      const page = await ctx.prisma.paginate({
        where: { userId },
      });
      return page;
    } else {
      const results = await ctx.prisma.findMany({});
      return stl.plugins.prisma.pagination.makeResponse(params, results);
    }
  },
});
