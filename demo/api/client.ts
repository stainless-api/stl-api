import type { api } from "./api";
import { api as routeMap } from "./api-route-map";
import { createUseReactQueryClient } from "@stl-api/react-query";

export const useClient = createUseReactQueryClient<typeof api>("/api", {
  routeMap,
});
