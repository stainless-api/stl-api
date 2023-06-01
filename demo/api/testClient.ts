import { createClient } from "stainless";
import type { api } from "./api";
import fetch from "node-fetch";

export const testClient = createClient<typeof api>(
  "http://localhost:3000/api",
  {
    fetch: fetch as any,
  }
);
