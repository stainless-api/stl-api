import { posts } from "~/api/posts";
import { stlNextPageRoute } from "@stl-api/next";

export default stlNextPageRoute(posts.actions.retrieve);
