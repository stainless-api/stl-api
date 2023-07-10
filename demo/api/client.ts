import type { api } from "./api";
import { createUseReactQueryClient } from "@stl-api/react-query";

export const useClient = createUseReactQueryClient<typeof api>("/api");
