import { stl } from "../../libs/stl";
import { retrieve } from "./retrieve";

export const params = stl.resource({
  summary: "Param parsing tests",
  // internal: true,
  actions: {
    retrieve,
  },
});
