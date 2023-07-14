import { createClient } from "stainless";
import type { api } from "./api";
import { api as routeMap } from "./api-route-map";
import fetch from "node-fetch";

export const baseUrl = `http://${
  process.env.CI ? "0.0.0.0:3005" : "localhost:3000"
}/api`;

export const testClient = createClient<typeof api>(baseUrl, {
  fetch: fetch as any,
  routeMap,
});

export const testClientPagesCatchAll = createClient<typeof api>(baseUrl, {
  fetch: fetch as any,
  routeMap,
  basePathMap: {
    "/api": "/api/v2",
  },
});

export const testClientAppCatchAll = createClient<typeof api>(baseUrl, {
  fetch: fetch as any,
  routeMap,
  basePathMap: {
    "/api": "/api/v3",
  },
});
