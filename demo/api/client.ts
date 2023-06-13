import { createClient } from "stainless";
import type { api } from "./api";
import { api as metadata } from "./api-metadata";

export const client = createClient<typeof api>("/api", { metadata });
