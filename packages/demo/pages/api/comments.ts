import { comments } from "@/api/comments";
import { stl } from "@/libs/stl";

export default stl.plugins.next.pageRoute(comments.actions.create);
