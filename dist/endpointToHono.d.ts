import { HttpEndpoint, HttpMethod } from "stainless";
/**
 * Converts an endpoint from a format like 'GET /users/{id}'
 * to ['get', '/users/:id']
 */
export declare function endpointToHono(endpoint: HttpEndpoint): [HttpMethod, string];
//# sourceMappingURL=endpointToHono.d.ts.map