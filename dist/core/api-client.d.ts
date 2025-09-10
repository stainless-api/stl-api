import { HttpMethod } from "stainless";
import { APIConfig, Client, ClientConfig } from "./api-client-types";
/**
 * Since the client needs to operate only on types,
 * we have to guess the correct HTTP verb from the method at the end of the client API call chain
 * @param action Client API method name, e.g. list, useRetrieve
 * @param body Request body
 * @returns HttpMethod
 */
export declare function inferHTTPMethod(action: string, body?: unknown): HttpMethod;
/**
 * Main entry for the client library
 * Provides an interface to construct API calls to a server with a matching API configuration
 * @param config
 * @returns Client API
 */
export declare function makeClientWithInferredTypes<API extends APIConfig, 
/** Unfortunately this cannot be infered from the parameter since the API generic needs to be specified */
Config extends ClientConfig>(config: Config): Client<API, Config>;
/**
 * Main entry for the client library
 * Provides an interface to construct API calls to a server with a matching API configuration
 * @param config
 * @returns Client API
 */
export declare function makeClientWithExplicitTypes<T>(config: ClientConfig): T;
//# sourceMappingURL=api-client.d.ts.map