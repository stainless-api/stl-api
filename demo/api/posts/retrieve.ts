import { stl } from "../../libs/stl";
import { z, t } from "stainless";
import { PrismaModelLoader } from "@stl-api/prisma";
import { prisma } from "../../libs/prismadb";
import { Post } from "./models";


type Path = {
  post: PrismaModelLoader<string, typeof prisma.post>;
};

type Query = {
  include?: t.Includes<Post, 3>,
  select?: t.Selects<Post, 3>
}

export const retrieve = stl
  .types<{ response: Post; path: Path; query: Query }>()
  .endpoint({
    endpoint: "get /api/posts/{post}",

    async handler({ post }, ctx) {
      return post;
    },
  });
