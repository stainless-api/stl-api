import { posts } from "~/api/posts";
import { stl } from "~/libs/stl";

export default stl.plugins.next.pageRoute(posts.actions.retrieve);
