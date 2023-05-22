import { api } from "@/api/api";
import { stl } from "@/libs/stl";

export default stl.plugins.next.catchAllRouter(api, {
  catchAllParam: "splat",
  basePathMap: { "/api/": "/api/v2/" },
});
