import { z } from "stainless";
import { stl } from "~/libs/stl";
import { PostPage } from "./models";

export const list = stl.endpoint({
  endpoint: "get /api/posts",
  query: z.PaginationParams.extend({
    sortBy: z.enum(["id"]).default("id"),
    userId: z.string().optional(),
    expand: z.expands(PostPage, 3).optional(),
    select: z.selects(PostPage, 3).optional(),
  }),
  response: PostPage,
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
