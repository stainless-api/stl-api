import { AnyResourceConfig, HttpMethod } from "stainless";
import { Client, ClientConfig } from "./api-client-types";

const methodSynonyms = {
  GET: ["get", "list", "retrieve"],
  POST: ["post", "create", "make"],
  PUT: ["put"],
  PATCH: ["patch", "update"],
  DELETE: ["delete", "destroy"],
  OPTIONS: [],
  HEAD: [],
} satisfies Record<HttpMethod, string[]>;

export function inferHTTPMethod(
  methodName: string,
  body?: unknown
): HttpMethod {
  for (const [method, words] of Object.entries(methodSynonyms)) {
    if (words.some((word) => methodName.toLowerCase().includes(word))) {
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

function makeUrl(callPath: string[]) {
  return callPath.join("/");
}

async function makeRequest(
  config: ClientConfig,
  action: string,
  callPath: string[],
  body?: unknown
) {
  const method = inferHTTPMethod(action, body);
  const url = makeUrl(callPath);
  const fetchFn = config.fetch ?? fetch;
  const options: RequestInit = body
    ? {
        body: JSON.stringify(body),
        method,
      }
    : { method };

  const response = await fetchFn(url, options);
  return await response.json();
}

function createClientProxy(
  config: ClientConfig,
  callPath: string[],
  pendingArgs: unknown[] = []
): unknown {
  const proxyClient = function () {};

  return new Proxy(proxyClient, {
    get(_target, key) {
      if (typeof key === "symbol") {
        return;
      }

      if (isAwaitingPromise(key)) {
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

      if (isCallingHook(lastCall)) {
        const action = callPath.slice(-1)[0];
        const path = callPath.slice(0, -1);
        const body = argumentsList[0];

        return {
          queryFn: () => makeRequest(config, action, path, body),
          queryKey: makeUrl(path),
        };
      }

      return createClientProxy(config, callPath, argumentsList);
    },
  });
}

export function makeClient<
  API extends {
    basePath: `/${string}`;
    resources: Record<string, AnyResourceConfig>;
  }
>(config: ClientConfig = {}): Client<API["basePath"], API["resources"]> {
  return createClientProxy(config, [config.basePath ?? "/api"]) as Client<
    API["basePath"],
    API["resources"]
  >;
}
