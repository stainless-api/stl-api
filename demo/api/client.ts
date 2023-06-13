import type { api } from "./api";
import { api as metadata } from "./api-metadata";
import { createReactQueryClient } from "@stl-api/react-query";

export const client = createReactQueryClient<typeof api>("/api", { metadata });
