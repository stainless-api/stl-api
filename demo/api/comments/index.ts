import { stl } from "~/libs/stl";
import { create } from "./create";
import { Comment, SelectableComment } from "./models";

export const comments = stl.resource({
  summary: "comments",
  internal: false,
  models: {
    Comment,
    SelectableComment,
  },
  actions: {
    create,
  },
});
