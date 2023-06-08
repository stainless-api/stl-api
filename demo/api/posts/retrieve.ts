import { stl } from "~/libs/stl";
import { z } from "stainless";
import prisma from "~/libs/prismadb";
import { Post } from "./models";

export const retrieve = stl.endpoint({
  endpoint: "get /api/posts/{post}",
  response: Post,

  path: z.path({
    post: z.string().prismaModelLoader(prisma.post),
  }),
  query: z.query({
    include: z.includes(Post, 3).optional(),
    select: z.selects(Post, 3).optional(),
  }),

  async handler({ post }, ctx) {
    return post;
  },
});
