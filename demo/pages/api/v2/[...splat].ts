import { api } from "../../../api/api";
import { stlNextPageCatchAllRouter } from "@stl-api/next";

export default stlNextPageCatchAllRouter(api, {
  catchAllParam: "splat",
  basePathMap: { "/api/": "/api/v2/" },
});
