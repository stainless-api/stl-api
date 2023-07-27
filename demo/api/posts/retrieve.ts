import { stl } from "../../libs/stl";
import { z, t } from "stainless";
import { PostResponse, PostIdLoader } from "./models";

type PathParams = {
  post: PostIdLoader;
};

type QueryParams = {
  include?: t.Includes<PostResponse, 3>;
  select?: t.Selects<PostResponse, 3>;
};

export const retrieve = stl
  .types<{ response: PostResponse; path: PathParams; query: QueryParams }>()
  .endpoint({
    endpoint: "GET /api/posts/{post}",

    async handler({ post }, ctx) {
      return post;
    },
  });
