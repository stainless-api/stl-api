import { stl } from "~/libs/stl";
import { create } from "./create";
import { Comment, CommentSelection } from "./models";

export const comments = stl.resource({
  summary: "comments",
  internal: false,
  models: {
    Comment,
    CommentSelection,
  },
  actions: {
    create,
  },
});
