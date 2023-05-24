import { stl } from "~/libs/stl";
import { create } from "./create";
import { list } from "./list";
import { retrieve } from "./retrieve";
import { Post, SelectablePost } from "./models";

export const posts = stl.resource({
  summary: "Posts; the tweets of this twitter clone",
  internal: false,
  models: {
    Post,
    SelectablePost,
  },
  actions: {
    create,
    list,
    retrieve,
  },
});
