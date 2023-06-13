import { createClient } from "stainless";
import type { api } from "./api";
import { api as metadata } from "./api-metadata";
import fetch from "node-fetch";

export const baseUrl = "http://localhost:3000/api";

export const testClient = createClient<typeof api>(baseUrl, {
  fetch: fetch as any,
  metadata,
});

export const testClientPagesCatchAll = createClient<typeof api>(baseUrl, {
  fetch: fetch as any,
  metadata,
  basePathMap: {
    "/api": "/api/v2",
  },
});

export const testClientAppCatchAll = createClient<typeof api>(baseUrl, {
  fetch: fetch as any,
  metadata,
  basePathMap: {
    "/api": "/api/v3",
  },
});
