import { comments } from "~/api/comments";
import { stlNextPageRoute } from "@stl-api/next";

export default stlNextPageRoute(comments.actions.create);
