import { createClient } from "stainless";
import type { api } from "./api";
import fetch from "node-fetch";

export const baseUrl = `http://localhost:${
  process.env.CI ? "3005" : "3000"
}/api`;

export const testClient = createClient<typeof api>(baseUrl, {
  fetch: fetch as any,
});
