import { AnyResourceConfig, HttpMethod } from "stainless";
import { APIConfig, Client, ClientConfig } from "./api-client-types";
import { kebabCase } from "../util/strings";
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
  const isHook = callSite.startsWith("use");
  return isHook;
}

function isValidPathParam(arg: unknown): arg is string | number {
  return typeof arg === "string" || typeof arg === "number";
}

function makeUrl(callPath: string[], outputCase: "camel" | "kebab" = "kebab") {
  return outputCase === "kebab"
    ? callPath.map(kebabCase).join("/")
    : callPath.join("/");
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
  callPath: string[],
  body?: unknown
) {
  const method = inferHTTPMethod(action, body);
  const url = makeUrl(callPath, config.urlCase);
  const fetchFn = config.fetch ?? fetch;
  const options: RequestInit = body
    ? {
        body: JSON.stringify(body),
        method,
      }
    : { method };

  console.log("Making request", { url, method, options });
  console.log({ fetchFn });

  const response = await fetchFn(url, options);

  console.log({ response });
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
      console.log("proxy get", key, { callPath, pendingArgs });
      if (typeof key === "symbol") {
        return;
      }

      if (isAwaitingPromise(key)) {
        console.log("if (isAwaitingPromise(key))");
        // Allow the subsequent "apply" hook to handle resolving the API request
        // Ensure the pendingArgs are passed through in case they contain a body param
        return createClientProxy(config, [...callPath, key], pendingArgs);
      }

      if (isValidPathParam(pendingArgs[0])) {
        callPath.push(pendingArgs[0].toString());
      }

      return createClientProxy(config, [...callPath, key], undefined);
    },
    apply(_target, _thisArg, argumentsList) {
      console.log("proxy apply", { callPath, pendingArgs, argumentsList });
      const lastCall = callPath[callPath.length - 1];

      if (isAwaitingPromise(lastCall)) {
        console.log("if (isAwaitingPromise(lastCall))");
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
        console.log("if (config.extensions)");
        const [action, extensionMethod] = callPath.slice(-2);
        const path = callPath.slice(0, -2);
        const body = argumentsList[0];
        console.log({ action, extensionMethod, path });
        const queryFn = () => makeRequest(config, action, path, body);
        const queryKey = [makeUrl(path, config.urlCase)];
        const handler = getExtensionHandler(
          config.extensions,
          extensionMethod,
          queryFn,
          queryKey
        );

        if (handler) {
          console.log("using extension handler");
          return handler(...argumentsList);
        }
        console.log("no extension handler found");
      }

      if (isCallingHook(lastCall)) {
        console.log("if (isCallingHook(lastCall))");
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
export function makeClient<
  API extends APIConfig,
  /** Unfortunately this cannot be infered from the parameter since the API generic needs to be specified */
  Config extends ClientConfig<API["basePath"]>
>(config: Config): Client<API, Config> {
  console.log("Making client");
  return createClientProxy(config, [config.basePath]) as Client<API, Config>;
}
