import { api } from "~/api/api";
import { stl } from "~/libs/stl";

export default stl.plugins.next.pageRoute(api.topLevel.actions.getOpenapi);
