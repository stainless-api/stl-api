import { stl } from "../../libs/stl";
import { z, t } from "stainless";
import { PostType } from "./models";
import prisma from "../../libs/prismadb";
import { PrismaModel } from "@stl-api/prisma";

type Query = {
  include?: t.Includes<PostType, 3>;
};

type Body = {
  body: string;
};

export const create = stl
  .types<{
    query: Query;
    body: Body;
    response: PrismaModel<PostType, typeof prisma.post>;
  }>()
  .endpoint({
    endpoint: "post /api/posts",
    config: {
      authenticated: true,
    },
    async handler({ body }, ctx) {
      return await ctx.prisma.create({
        data: {
          userId: ctx.requireCurrentUser().id,
          body,
        },
      });
    },
  });
