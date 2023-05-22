import { createClient } from "@stl-api/stl";
import type { api } from "./api";

export const client = createClient<typeof api>("/api");
