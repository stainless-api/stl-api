import { stl } from "@/libs/stl";
import z from "zod";
import prisma from "@/libs/prismadb";
import { Post } from "./models";

export const retrieve = stl.endpoint({
  endpoint: "get /api/posts/{post}",
  path: z.object({
    post: z.string().prismaModelLoader(prisma.post),
  }),
  query: z.object({
    expand: stl.expandParam(Post, 3).optional(),
    select: stl.selectParam(Post, 3).optional(),
  }),
  response: Post,
  async handler({ post }, ctx) {
    return post;
  },
});
