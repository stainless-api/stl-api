import { users } from "~/api/users";
import { stl } from "~/libs/stl";

export default stl.plugins.next.pageRoute(users.actions.list);
