import { stl } from "~/libs/stl";
import { z } from "stainless";
import { User } from "./models";

export const list = stl.endpoint({
  endpoint: "get /api/users",
  response: z.pageResponse(User),

  query: z.PaginationParams.extend({
    sortBy: z.enum(["createdAt"]).default("createdAt"),
    sortDirection: z.enum(["desc"]).default("desc"),
  }),
  async handler(params, ctx) {
    return await ctx.prisma.paginate({});
  },
});
