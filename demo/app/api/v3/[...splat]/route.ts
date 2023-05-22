import { api } from "~/api/api";
import { stl } from "~/libs/stl";

const { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS } =
  stl.plugins.next.appCatchAllRouter(api, {
    catchAllParam: "splat",
    basePathMap: { "/api/": "/api/v3/" },
  });

export { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS };
