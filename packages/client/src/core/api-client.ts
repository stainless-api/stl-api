import { HttpMethod } from "stainless";
import { APIConfig, Client, ClientConfig } from "./api-client-types";
import { camelCase, kebabCase } from "../util/strings";
import { getExtensionHandler } from "../extensions";

const methodSynonyms = {
  GET: ["get", "list", "retrieve"],
  POST: ["post", "create", "make"],
  PUT: ["put"],
  PATCH: ["patch", "update"],
  DELETE: ["delete", "destroy"],
  OPTIONS: [],
  HEAD: [],
} satisfies Record<HttpMethod, string[]>;

/**
 * Since the client needs to operate only on types,
 * we have to guess the correct HTTP verb from the method at the end of the client API call chain
 * @param action Client API method name, e.g. list, useRetrieve
 * @param body Request body
 * @returns HttpMethod
 */
export function inferHTTPMethod(action: string, body?: unknown): HttpMethod {
  for (const [method, words] of Object.entries(methodSynonyms)) {
    if (words.some((word) => action.toLowerCase().includes(word))) {
      return method as HttpMethod; // Object.entries is poorly typed
    }
  }

  return body ? "POST" : "GET";
}

function isAwaitingPromise(callSite: string) {
  return callSite === "then";
}

function isCallingHook(callSite: string) {
  const hookRegex = /use[A-Z]\w+/;
  const isHook = callSite.match(hookRegex);
  return isHook;
}

function isValidPathParam(arg: unknown): arg is string | number {
  return typeof arg === "string" || typeof arg === "number";
}

function makeUrl(callPath: string[], outputCase: "camel" | "kebab" = "kebab") {
  return outputCase === "kebab"
    ? callPath
        .map((str) =>
          str.startsWith(":") ? str.replace(":", "") : kebabCase(str)
        )
        .join("/")
    : callPath.map((str) => str.replace(":", "")).join("/");
}

/**
 * Our wrapper around fetch. For now we presume the response is JSON and handle it as such for the caller.
 * @param config
 * @param action Client API method name, e.g. list, useRetrieve
 * @param callPath Each part of the URL we will hit based on the client API call chain
 * @param body Request body
 * @returns
 */
async function makeRequest(
  config: ClientConfig<string>,
  action: string,
  [basePath, ...callPath]: string[],
  body?: unknown
) {
  const method = inferHTTPMethod(action, body);
  const url = `${basePath}/${makeUrl(callPath, config.urlCase)}`;
  const fetchFn = config.fetch ?? fetch;
  const options: RequestInit =
    method !== "GET" && body !== undefined
      ? {
          body: JSON.stringify(body),
          method,
          headers: {
            "Content-Type": "application/json",
          },
        }
      : { method };

  const response = await fetchFn(url, options);

  return await response.json();
}

function createClientProxy(
  config: ClientConfig<string>,
  callPath: string[],
  pendingArgs: unknown[] = []
): unknown {
  const proxyClient = function () {};

  return new Proxy(proxyClient, {
    get(_target, key) {
      if (typeof key === "symbol" || key === "prototype") {
        return;
      }

      if (isAwaitingPromise(key)) {
        // Allow the subsequent "apply" hook to handle resolving the API request
        // Ensure the pendingArgs are passed through in case they contain a body param
        return createClientProxy(config, [...callPath, key], pendingArgs);
      }

      if (isValidPathParam(pendingArgs[0])) {
        callPath.push(":" + pendingArgs[0].toString());
      }

      return createClientProxy(config, [...callPath, key], undefined);
    },
    apply(_target, _thisArg, argumentsList) {
      const lastCall = callPath[callPath.length - 1];

      if (isAwaitingPromise(lastCall)) {
        const [resolve, reject] = argumentsList;
        // Remove "then" from callPath and use previous args
        callPath.pop();
        const action = callPath.slice(-1)[0];
        const path = callPath.slice(0, -1);
        const body = pendingArgs[0];
        const request = makeRequest(config, action, path, body);

        return request.then(resolve).catch(reject);
      }

      if (config.extensions) {
        const [action, extensionMethod] = callPath.slice(-2);
        const path = callPath.slice(0, -2);
        const body = argumentsList[0];
        const queryFn = (callTimeBody?: any) =>
          makeRequest(config, action, path, callTimeBody ?? body);
        const queryKey = [makeUrl(path, config.urlCase)];
        const handler = getExtensionHandler(
          config.extensions,
          extensionMethod,
          queryFn,
          queryKey
        );

        if (handler) {
          return handler(...argumentsList);
        }
      }

      if (isCallingHook(lastCall)) {
        const action = callPath.slice(-1)[0];
        const path = callPath.slice(0, -1);
        const body = argumentsList[0];

        return {
          queryFn: () => makeRequest(config, action, path, body),
          queryKey: [makeUrl(path, config.urlCase)],
        };
      }

      return createClientProxy(config, callPath, argumentsList);
    },
  });
}

/**
 * Main entry for the client library
 * Provides an interface to construct API calls to a server with a matching API configuration
 * @param config
 * @returns Client API
 */
export function makeClientWithInferredTypes<
  API extends APIConfig,
  /** Unfortunately this cannot be infered from the parameter since the API generic needs to be specified */
  Config extends ClientConfig<API["basePath"]>
>(config: Config): Client<API, Config> {
  return createClientProxy(config, [config.basePath]) as Client<API, Config>;
}

/**
 * Main entry for the client library
 * Provides an interface to construct API calls to a server with a matching API configuration
 * @param config
 * @returns Client API
 */
export function makeClientWithExplicitTypes<T>(config: ClientConfig): T {
  return createClientProxy(config, [config.basePath]) as T;
}
