import type { api } from "./api";
import { api as metadata } from "./api-metadata";
import { createUseReactQueryClient } from "@stl-api/react-query";

export const useClient = createUseReactQueryClient<typeof api>("/api", {
  metadata,
});
