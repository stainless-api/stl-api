import { createClient } from "stainless";
import type { api } from "./api";

export const client = createClient<typeof api>("/api");
