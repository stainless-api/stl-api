import { AnyResourceConfig } from "stainless";
import { Client } from "./api-client-types";
import { PathPart } from "./endpoint-string";

interface ClientConfig {
  fetch?: typeof fetch;
}

const emptyFn = function () {};

function isLastAppyCall(callSite: string) {
  const isAwaited = callSite === "then";
  const isHook = callSite.startsWith("use");
  return isAwaited || isHook;
}

let i = 0;

type CallPathPart = {
  handler: "base" | "get" | "apply" | "param";
  name: string;
  args?: unknown[];
};

const methodSynonyms = {
  GET: ["get", "list", "retrieve"],
  POST: ["post", "create", "make"],
  PUT: ["put"],
  PATCH: ["patch", "update"],
  DELETE: ["delete", "destroy"],
};

function inferMethod({ name, args }: CallPathPart) {
  for (const [method, words] of Object.entries(methodSynonyms)) {
    if (words.includes(name)) {
      return method;
    }
  }

  return args ? "POST" : "GET";
}

function constructPath(callPath: CallPathPart[]) {
  const path = callPath.map((pathPart) => pathPart.name).join("/");
  console.log({ parts: callPath, path });

  return path;
}

async function makeRequest(config: ClientConfig, callPath: CallPathPart[]) {
  console.log("Making request");
  const method = inferMethod(callPath.pop()!);
  const url = constructPath(callPath);
  const fetchFn = config.fetch ?? fetch;
  const response = await fetchFn(url, { method });
  console.log("Returning response");
  return response.json();
}

function createClientProxy(
  config: ClientConfig,
  callPath: CallPathPart[] = [],
  pendingArgs?: unknown[]
): unknown {
  // Object.defineProperty(emptyFn, "name", {
  //   value: callPath[callPath.length - 1],
  //   writable: false,
  // });

  return new Proxy(emptyFn, {
    get(target, key) {
      console.log(i++, "get", { target, key, callPath, pendingArgs });
      if (typeof key === "symbol") {
        return;
      }

      if (isLastAppyCall(key)) {
        return makeRequest(config, callPath);
      }

      if (pendingArgs) {
        callPath.push({
          handler: "param",
          name: pendingArgs.join("/"),
        });
      }

      const pathPart = { handler: "get", name: key } as const;
      return createClientProxy(config, [...callPath, pathPart]);
    },
    apply(_target, _thisArg, argumentsList) {
      // console.log(i++, "apply", {
      //   target,
      //   thisArg,
      //   argumentsList,
      //   callPath,
      //   pendingArgs,
      // });

      // if (isLastAppyCall(callPath)) {
      //   return makeRequest(config, callPath);
      // }

      // const pathPart = {
      //   handler: "apply",
      //   name: argumentsList.every(
      //     (arg) => typeof arg === "string" || typeof arg === "number"
      //   )
      //     ? argumentsList.join("/")
      //     : "body",
      //   args: argumentsList,
      // } as const;

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
  const basePathPart = {
    handler: "base",
    name: "/api",
  } as const satisfies PathPart;

  return createClientProxy(config, [basePathPart]) as Client<
    API["basePath"],
    API["resources"]
  >;
}
