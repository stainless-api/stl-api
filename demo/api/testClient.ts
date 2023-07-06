import { createClient } from "stainless";
import type { api } from "./api";
import fetch from "node-fetch";

export const baseUrl = `http://${
  process.env.CI ? "0.0.0.0:3005" : "localhost:3000"
}/api`;

export const testClient = createClient<typeof api>(baseUrl, {
  fetch: fetch as any,
});
