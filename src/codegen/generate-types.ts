import { printNode, zodToTs } from "zod-to-ts";
import { APIConfig, ClientConfig } from "../core/api-client-types";
import { AnyActionsConfig, ResourceConfig, z } from "stainless";
import { splitPathIntoParts } from "../core/endpoint";
import { camelCase, capitalize } from "../util/strings";
import { ZodTypeAny } from "stainless/dist/z";
import dedent from "dedent-js";
import prettier from "prettier";
import * as _ from "lodash";

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
    const key = Object.keys(returnValue)[0];
    const existingIndex = obj[current.name].asParam.findIndex((param: any) => {
      return Object.keys(param).includes(key);
    });

    if (existingIndex > -1) {
      obj[current.name].asParam[existingIndex] = _.merge(
        obj[current.name].asParam[existingIndex],
        returnValue
      );
    } else {
      obj[current.name].asParam = [...obj[current.name].asParam, returnValue];
    }
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
  const { node } = zodToTs(schema, undefined, { nativeEnums: "union" });
  const nodeString = printNode(node);
  // This happens with large, lazily loaded zod types
  return nodeString.replace(/\bIdentifier\b/g, "unknown");
}

function makeParameterType(
  name: string,
  value: ApiMap[],
  api: APIConfig,
  config: ClientConfig
): string[] {
  const types: string[] = [`(${camelCase(name)}: string | number): {`];
  value
    .map((v) => makeTypesFromApiMap(v, api, config))
    .forEach((subTypes) => {
      types.push(...subTypes);
    });
  types.push("};");

  return types;
}

function makeResourceType(
  name: string,
  value: Record<string, ApiMap>,
  api: APIConfig,
  config: ClientConfig
): string[] {
  const subTypes: string[] = [];

  Object.entries(value).forEach(([k, v]) => {
    const entryTypes = makeTypesFromApiMap(
      { [k]: v } as unknown as ApiMap,
      api,
      config
    );
    subTypes.push(...entryTypes);
  });

  return [`${camelCase(name)}: {`, ...subTypes, "};"];
}

function makeActionType(
  name: string,
  actionPath: string,
  api: APIConfig,
  config: ClientConfig
): string[] {
  const resources = actionPath.split(".");
  const action = api.resources[resources[0]].actions[resources[1]];
  const types: string[] = [];
  const body = action.body ? `body: ${zodToString(action.body)}` : "";
  const query = action.query
    ? `${body.length ? ", " : ""}query?: ${zodToString(action.query)}`
    : "";
  const returnType = action.response ? zodToString(action.response) : "void";

  types.push(dedent`
    use${capitalize(camelCase(name))}(${body}${query}): {
      queryFn(): Promise<${returnType}>;
      queryKey: string[];
    };`);

  if (config.extensions) {
    const input = action.body ? zodToString(action.body) : undefined;
    const extensionMethds = dedent`
        useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<${returnType}>;
        useSuspenseQuery(opts?: UseSuspenseQueryOptions): ReactQuery.UseSuspenseQueryResult<${returnType}>;
    `;
    const extensionMutationMethod =
      input !== undefined
        ? dedent`useMutation(opts?: UseMutationOptions<${returnType}, unknown, ${input}>): ReactQuery.UseMutationResult<${returnType}, unknown, ${input}>;`
        : dedent`useMutation(opts?: UseMutationOptions<${returnType}, unknown, void>): ReactQuery.UseMutationResult<${returnType}, unknown, void>;`;
    const extensionQueryKeyMethod = `getQueryKey(): string[];`;

    if (body.length || query.length) {
      types.push(
        `${camelCase(name)}: {
          (${body}${query}): Promise<${returnType}> & {${extensionMethds}};
          ${extensionMutationMethod}
          ${extensionQueryKeyMethod}
        };`
      );
    } else {
      types.push(dedent`${camelCase(name)}: {
        (): Promise<${returnType}>;
        ${extensionMethds}
        ${extensionMutationMethod}
        ${extensionQueryKeyMethod}
      };`);
    }
  } else {
    types.push(`${camelCase(name)}(${body}${query}): Promise<`);
    types.push(`${returnType}`);
    types.push(">;");
  }

  return types;
}

function makeTypesFromApiMap(
  apiMap: ApiMap,
  api: APIConfig,
  config: ClientConfig
) {
  const types: string[] = [];

  Object.entries(apiMap).forEach(([k, v]) => {
    if (v.asParam) {
      const subTypes = makeParameterType(k, v.asParam, api, config);
      types.push(...subTypes);
    }

    if (v.asResource) {
      const subTypes = makeResourceType(k, v.asResource, api, config);
      types.push(...subTypes);
    }

    if (v.asAction) {
      const subTypes = makeActionType(k, v.actionPath, api, config);
      types.push(...subTypes);
    }
  });

  return types;
}

function makeTypes(
  apiMap: ApiMap,
  api: APIConfig,
  config: ClientConfig,
  installLocation: string,
  reactQueryAlias: string
) {
  const output: string[] = [];
  output.push(dedent`
    /* eslint-disable prettier/prettier */
    // This is an auto-generated file, any manual changes will be overwritten.
    import { ClientConfig, makeClientWithExplicitTypes } from "${installLocation}";
  `);

  if (config.extensions) {
    output.push(dedent`
      // React-query extension related types
      import * as ReactQuery from "${reactQueryAlias}";

      type StlApiProvidedOpts = "queryFn" | "queryKey" | "mutationFn";
      type UseQueryOptions = Omit<ReactQuery.UseQueryOptions, StlApiProvidedOpts>;
      type UseSuspenseQueryOptions = Omit<ReactQuery.UseSuspenseQueryOptions, StlApiProvidedOpts>;
      type UseMutationOptions<TData = unknown, TError = Error, TVariables = void, TContext = unknown> = Omit<
        ReactQuery.UseMutationOptions<TData, TError, TVariables, TContext>,
        StlApiProvidedOpts
      >;
    `);
  }

  output.push(dedent`
    export interface Client {
      ${makeTypesFromApiMap(apiMap, api, config).join("\n")}
    }
    
    export function makeClient(config: ClientConfig) {
      // prettier-ignore
      return makeClientWithExplicitTypes<Client>(config);
    }    
  `);

  return output;
}

export async function generateOutput<API extends APIConfig>(
  api: API,
  config: ClientConfig,
  installLocation: string = "@stl-api/client",
  reactQueryAlias: string = "@tanstack/react-query"
) {
  const resources = getResources(api.resources);
  const endpoints = getEndpoints(resources);
  const apiMap = nestEndpoints(endpoints, api.basePath);
  const output = makeTypes(
    apiMap,
    api,
    config,
    installLocation,
    reactQueryAlias
  );

  return await prettier.format(output.flat().join("\n"), {
    parser: "babel",
  });
}
