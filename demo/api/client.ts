import type { api } from "./api";
import { createReactQueryClient } from "@stl-api/react-query";

export const client = createReactQueryClient<typeof api>("/api");
