import { z } from "stainless";
import { stl } from "../../libs/stl";
import { PostPage } from "./models";

export const list = stl.endpoint({
  endpoint: "GET /api/posts",
  response: PostPage,

  query: z.PaginationParams.extend({
    sortBy: z.enum(["id"]).default("id"),
    userId: z.string().optional(),
    // include: z.includes(PostPage).optional(),
    select: z.selects(PostPage).optional(),
  }),
  async handler({ userId, ...params }, ctx) {
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
