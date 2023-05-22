import { stl } from "~/libs/stl";
import { users } from "./users";
import { posts } from "./posts";
import { comments } from "./comments";

export const api = stl.api({
  openapi: {
    endpoint: "get /api/openapi",
  },
  resources: {
    users,
    posts,
    comments,
  },
});
