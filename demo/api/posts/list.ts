import { z } from "stainless";
import { stl } from "../../libs/stl";
import { PostPageSchema } from "./models";

export const list = stl.endpoint({
  endpoint: "get /api/posts",
  response: PostPageSchema,

  query: z.PaginationParams.extend({
    sortBy: z.enum(["id"]).default("id"),
    userId: z.string().optional(),
    include: z.includes(PostPageSchema).optional(),
    select: z.selects(PostPageSchema).optional(),
  }),
  async handler({ userId, include, ...params }, ctx) {
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
