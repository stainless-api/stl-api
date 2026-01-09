import { Result } from "hono/router";
import { TrieRouter } from "hono/router/trie-router";
import {
  AnyEndpoint,
  HttpEndpoint,
  HttpMethod,
  parseEndpoint,
} from "stainless";

/**
 * Converts an endpoint from a format like 'GET /users/{id}'
 * to ['GET', '/users/:id']
 */
function endpointToHono(endpoint: HttpEndpoint): [HttpMethod, string] {
  const [method, path] = parseEndpoint(endpoint);

  const pathParts = path
    .split("/")
    .map((el) => el.replace(/^\{([^}]+)\}$/, ":$1"));

  const unsupportedEl = pathParts.find((el) => el.includes("{"));
  if (unsupportedEl) {
    // TODO: hono routers don't support variables in the middle of a
    // path element, but they do support regexes, so we'd need to convert
    // this
    throw new Error(`path element isn't currently supported: ${unsupportedEl}`);
  }

  return [method, pathParts.join("/")];
}

export function makeRouteMatcher(endpoints: AnyEndpoint[]) {
  const routeMatcher: TrieRouter<AnyEndpoint> = new TrieRouter();
  for (const endpoint of endpoints) {
    const [method, path] = endpointToHono(endpoint.endpoint);
    routeMatcher.add(method, path, endpoint);
    if (method === "GET") {
      // Hono route matching is method-specific, so also add a
      // HEAD route for GET endpoints
      routeMatcher.add("HEAD", path, endpoint);
    }
  }

  return routeMatcher;
}

export function isValidRouteMatch(m: Result<AnyEndpoint>) {
  if (!m) return false;

  if (m[0].length === 0) return false;

  return true;
}
