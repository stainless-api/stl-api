import { api } from "../../../../api/api";
import { stlNextAppCatchAllRouter } from "@stl-api/next";

const { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS } =
  stlNextAppCatchAllRouter(api, {
    catchAllParam: "splat",
    basePathMap: { "/api/": "/api/v3/" },
  });

export { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS };
