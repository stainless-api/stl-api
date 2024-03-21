import { printNode, zodToTs } from "zod-to-ts";
import { APIConfig, ClientConfig } from "../core/api-client-types";
import { AnyActionsConfig, ResourceConfig, z } from "stainless";
import { splitPathIntoParts } from "../core/endpoint";
import { camelCase, capitalize } from "../util/strings";
import { ZodTypeAny } from "stainless/dist/z";
import dedent from "dedent-js";

type GenericResourceConfi = ResourceConfig<AnyActionsConfig, any, any>;

type FlatResource = Omit<GenericResourceConfi, "namespacedResources">;

function getResources(
  resources: Record<string, GenericResourceConfi>,
  path?: string
): { resourceName: string; resourcePath: string; resource: FlatResource }[] {
  return Object.entries(resources).flatMap(
    ([resourceName, { namespacedResources, ...resource }]) => {
      const resourcePath = path ? [path, resourceName].join(".") : resourceName;

      if (namespacedResources) {
        return [
          { resourceName, resourcePath, resource },
          ...getResources(namespacedResources, resourcePath),
        ];
      }

      return [{ resourceName, resourcePath, resource }];
    }
  );
}

function getEndpoints(
  resources: {
    resourceName: string;
    resourcePath: string;
    resource: FlatResource;
  }[]
) {
  return resources.flatMap(({ resourcePath, resource }) =>
    Object.entries(resource.actions).map(([actionName, action]) => {
      const actionPath = [resourcePath, actionName].join(".");
      return {
        actionName,
        actionPath,
        endpoint: action?.endpoint,
        pathParts: [
          ...splitPathIntoParts((action as any).endpoint).map((a) => ({
            ...a,
            actionPath,
          })),
          { type: "action", name: actionName, actionPath },
        ] satisfies PathPartWithActions[],
        pathParams: action?.path,
        body: action?.body,
        query: action?.query,
        handler: action?.handler,
        response: action?.response,
      };
    })
  );
}

interface ApiMap {
  [resource: string]: {
    actionPath: string;
    asResource?: Record<string, ApiMap>;
    asParam?: ApiMap[];
    asAction?: true;
  };
}

type PathPartWithActions =
  | { type: "param"; name: string; actionPath: string }
  | { type: "resource"; name: string; actionPath: string }
  | { type: "action"; name: string; actionPath: string };

function recursiveSet(
  obj: Record<string, any> = {},
  items: PathPartWithActions[]
) {
  const [current, ...rest] = items;

  if (!current) {
    return;
  }

  if (!obj[current.name]) {
    obj[current.name] = {
      actionPath: current.actionPath,
    };
  }

  if (current.type === "action") {
    obj[current.name].asAction = true;
    return;
  }

  if (current.type === "resource") {
    if (!obj[current.name].asResource) {
      obj[current.name].asResource = {};
    }
    recursiveSet(obj[current.name].asResource, rest);
    return;
  }

  if (current.type === "param") {
    if (!obj[current.name].asParam) {
      obj[current.name].asParam = [];
    }
    const returnValue = {};
    recursiveSet(returnValue, rest);
    obj[current.name].asParam = [...obj[current.name].asParam, returnValue];
    return;
  }
}

function nestEndpoints(
  endpoints: ReturnType<typeof getEndpoints>,
  basePath: string = ""
) {
  const api: ApiMap = {};

  endpoints.forEach((endpoint) => {
    const filterdPathParts = endpoint.pathParts.filter(
      (pathPart) => pathPart.name !== basePath.replace("/", "")
    );
    recursiveSet(api, filterdPathParts);
  });

  return api;
}

function zodToString(schema: ZodTypeAny) {
  const { node } = zodToTs(schema);
  const nodeString = printNode(node);
  return nodeString;
}

function makeParameterType(
  name: string,
  value: ApiMap[],
  api: APIConfig,
  config: ClientConfig
): [string[], string[]] {
  const supportingTypes: string[] = [];
  const mainTypes: string[] = [`(${camelCase(name)}: string | number): {`];
  value
    .map((v) => makeTypesFromApiMap(v, api, config))
    .forEach((subTypes) => {
      supportingTypes.push(...subTypes[0]);
      mainTypes.push(...subTypes[1]);
    });
  mainTypes.push("}");

  return [supportingTypes, mainTypes];
}

function makeResourceType(
  name: string,
  value: Record<string, ApiMap>,
  api: APIConfig,
  config: ClientConfig
): [string[], string[]] {
  const subTypes: string[][] = [[], []];

  Object.entries(value).forEach(([k, v]) => {
    const entryTypes = makeTypesFromApiMap(
      { [k]: v } as unknown as ApiMap,
      api,
      config
    );
    subTypes[0].push(...entryTypes[0]);
    subTypes[1].push(...entryTypes[1]);
  });

  const mainTypes: string[] = [`${camelCase(name)}: {`, ...subTypes[1], "}"];

  return [subTypes[0], mainTypes];
}

function makeActionType(
  name: string,
  actionPath: string,
  api: APIConfig,
  config: ClientConfig
): [string[], string[]] {
  const supportingTypes: string[] = [];
  const resources = actionPath.split(".");
  const action = api.resources[resources[0]].actions[resources[1]];
  const mainTypes: string[] = [];
  const body = action.body ? `body: ${zodToString(action.body)}` : "";
  const returnType = action.response ? zodToString(action.response) : "void";

  mainTypes.push(dedent`
    use${capitalize(camelCase(name))}(${body}): {
      queryFn(): Promise<${returnType}>
      queryKey: string[];
    }`);

  if (config.extensions) {
    if (action.body) {
      const input = zodToString(action.body);

      mainTypes.push(dedent`
        ${camelCase(name)}: {
          (${body}): Promise<${returnType}>;
          useQuery(
            body: ${input},
            opts?: UseQueryOptions
          ): ReactQuery.UseQueryResult<${returnType}>;
          useSuspenseQuery(
            body: ${input},
            opts?: UseQueryOptions
          ): ReactQuery.UseSuspenseQueryResult<${returnType}>;
          useMutation(
            opts?: UseMutationOptions
          ): ReactQuery.UseMutationResult<${input}, unknown, ${returnType}>;
          getQueryKey(): string[];
          };`);
    } else {
      mainTypes.push(dedent`
        ${camelCase(name)}: {
          (${body}): Promise<${returnType}>;
          useQuery(
            opts?: UseQueryOptions
          ): ReactQuery.UseQueryResult<${returnType}>;
          useSuspenseQuery(
            opts?: UseQueryOptions
          ): ReactQuery.UseSuspenseQueryResult<${returnType}>;
          useMutation(
            opts?: UseMutationOptions
          ): ReactQuery.UseMutationResult<undefined, unknown, ${returnType}>;
          getQueryKey(): string[];
          };`);
    }
  } else {
    mainTypes.push(`${camelCase(name)}(${body}): Promise<`);
    mainTypes.push(`${returnType}`);
    mainTypes.push(">;");
  }

  return [supportingTypes, mainTypes];
}

function makeTypesFromApiMap(
  apiMap: ApiMap,
  api: APIConfig,
  config: ClientConfig
) {
  const supportingTypes: string[] = [];
  const mainTypes: string[] = [];

  Object.entries(apiMap).forEach(([k, v]) => {
    if (v.asParam) {
      const subTypes = makeParameterType(k, v.asParam, api, config);
      supportingTypes.push(...subTypes[0]);
      mainTypes.push(...subTypes[1]);
    }

    if (v.asResource) {
      const subTypes = makeResourceType(k, v.asResource, api, config);
      supportingTypes.push(...subTypes[0]);
      mainTypes.push(...subTypes[1]);
    }

    if (v.asAction) {
      const subTypes = makeActionType(k, v.actionPath, api, config);
      supportingTypes.push(...subTypes[0]);
      mainTypes.push(...subTypes[1]);
    }
  });

  return [supportingTypes, mainTypes];
}

function makeTypes(apiMap: ApiMap, api: APIConfig, config: ClientConfig) {
  const output: string[] = [];
  output.push(
    "// This is an auto-generated file, any manual changes will be overwritten."
  );
  if (config.extensions) {
    output.push('import * as ReactQuery from "@tanstack/react-query";');
    output.push(
      'type StlApiProvidedOpts = "queryFn" | "queryKey" | "mutationFn";'
    );
    output.push(
      "type UseQueryOptions = Omit<ReactQuery.UseQueryOptions, StlApiProvidedOpts>;"
    );
    output.push(
      "type UseMutationOptions = Omit<ReactQuery.UseMutationOptions, StlApiProvidedOpts>;"
    );
  }
  output.push("export interface Client {");

  const [supportingTypes, mainTypes] = makeTypesFromApiMap(apiMap, api, config);
  output.unshift(...supportingTypes);
  output.push(...mainTypes);

  output.push("}");
  output.push("export const client = {} as Client;");
  return output;
}

export function generateOutput<API extends APIConfig>(
  api: API,
  config: ClientConfig<API["basePath"]>
) {
  const resources = getResources(api.resources);
  const endpoints = getEndpoints(resources);
  const apiMap = nestEndpoints(endpoints, config.basePath);
  const output = makeTypes(apiMap, api, config);

  return output.flat().join("\n");
}
