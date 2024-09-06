import { HttpEndpoint, HttpMethod, parseEndpoint } from "stainless";

/**
 * Converts an endpoint from a format like 'GET /users/{id}'
 * to ['get', '/users/:id']
 */
export function endpointToHono(endpoint: HttpEndpoint): [HttpMethod, string] {
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
