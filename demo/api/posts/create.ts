import { stl } from "../../libs/stl";
import { z, t } from "stainless";
import { PostType } from "./models";

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
    response: PostType;
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
