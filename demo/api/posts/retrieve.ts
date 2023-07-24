import { stl } from "../../libs/stl";
import { z, t } from "stainless";
import { PostType, PostLoader } from "./models";

type Path = {
  post: PostLoader;
};

type Query = {
  include?: t.Includes<PostType, 3>;
  select?: t.Selects<PostType, 3>;
};

export const retrieve = stl
  .types<{ response: PostType; path: Path; query: Query }>()
  .endpoint({
    endpoint: "get /api/posts/{post}",

    async handler({ post }, ctx) {
      return post;
    },
  });
