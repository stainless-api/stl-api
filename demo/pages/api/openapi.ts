import { api } from "~/api/api";
import { stlNextPageRoute } from "@stl-api/next";

export default stlNextPageRoute(api.topLevel.actions.getOpenapi);
