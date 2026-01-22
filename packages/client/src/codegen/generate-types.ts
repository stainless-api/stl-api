import { printNode, zodToTs, createAuxiliaryTypeStore } from "zod-to-ts";
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

// Map zod/v3 typeName (e.g. "ZodString") to zod v4 type (e.g. "string")
function mapZodV3TypeToV4(typeName: string): string {
  // Remove "Zod" prefix and lowercase
  if (typeName.startsWith("Zod")) {
    const type = typeName.slice(3).toLowerCase();
    // Map native enums to enum since zod-to-ts v2 only handles "enum"
    if (type === "nativeenum") {
      return "enum";
    }
    return type;
  }
  return typeName.toLowerCase();
}

// Wrap a value to recursively add _zod to any nested schemas
function wrapSchemaValue(value: any, cache: WeakMap<object, any>): any {
  if (!value || typeof value !== "object") return value;

  // Check if it's a zod schema (has _def)
  if (value._def && !value._zod) {
    return wrapSchemaForZodToTs(value, cache);
  }

  // Wrap arrays (for union options, tuple items, etc.)
  if (Array.isArray(value)) {
    return value.map((item) => wrapSchemaValue(item, cache));
  }

  // Wrap plain objects (for object shapes)
  if (value.constructor === Object) {
    const result: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      result[key] = wrapSchemaValue(value[key], cache);
    }
    return result;
  }

  return value;
}

// Create a v4-compatible _zod.def object from v3 _def
function createV4CompatDef(v3Def: any, cache: WeakMap<object, any>): any {
  const type = mapZodV3TypeToV4(v3Def.typeName);

  const result: any = {
    type,
  };

  // Map v3 property names to v4 equivalents and wrap nested schemas
  // Array: v3 uses _def.type, v4 uses def.element
  if (v3Def.type && v3Def.type._def) {
    result.element = wrapSchemaValue(v3Def.type, cache);
  }

  // Object shape: v3 uses _def.shape() function, v4 uses def.shape object
  if (typeof v3Def.shape === "function") {
    const shapeObj = v3Def.shape();
    result.shape = wrapSchemaValue(shapeObj, cache);
  } else if (v3Def.shape && typeof v3Def.shape === "object") {
    result.shape = wrapSchemaValue(v3Def.shape, cache);
  }

  // Optional/Nullable: innerType
  if (v3Def.innerType) {
    result.innerType = wrapSchemaValue(v3Def.innerType, cache);
  }

  // Union: options array
  if (v3Def.options) {
    result.options = wrapSchemaValue(v3Def.options, cache);
  }

  // Intersection: left and right
  if (v3Def.left) {
    result.left = wrapSchemaValue(v3Def.left, cache);
  }
  if (v3Def.right) {
    result.right = wrapSchemaValue(v3Def.right, cache);
  }

  // Tuple: items
  if (v3Def.items) {
    result.items = wrapSchemaValue(v3Def.items, cache);
  }

  // Record/Map: keyType and valueType
  if (v3Def.keyType) {
    result.keyType = wrapSchemaValue(v3Def.keyType, cache);
  }
  if (v3Def.valueType) {
    result.valueType = wrapSchemaValue(v3Def.valueType, cache);
  }

  // Lazy: getter
  if (v3Def.getter) {
    result.getter = () => wrapSchemaValue(v3Def.getter(), cache);
  }

  // Effects (transform/refine): schema/innerType
  if (v3Def.schema) {
    result.innerType = wrapSchemaValue(v3Def.schema, cache);
  }

  // Enum: entries or values
  // v3 ZodEnum has values as array, v3 ZodNativeEnum has values as object
  if (v3Def.values) {
    if (Array.isArray(v3Def.values)) {
      result.entries = v3Def.values.reduce(
        (acc: Record<string, string>, v: string) => {
          acc[v] = v;
          return acc;
        },
        {}
      );
    } else if (typeof v3Def.values === "object") {
      // Native enum - values is already an object
      result.entries = v3Def.values;
    }
  }

  // Literal: values array
  if (v3Def.value !== undefined) {
    result.values = [v3Def.value];
  }

  // Promise: innerType
  if (v3Def.type && type === "promise") {
    result.innerType = wrapSchemaValue(v3Def.type, cache);
  }

  // Catchall for objects - skip if it's ZodNever (strict mode default)
  // because `[x: string]: never` is semantically "no extra properties" but
  // generates invalid TypeScript when combined with known properties
  if (v3Def.catchall && v3Def.catchall._def?.typeName !== "ZodNever") {
    result.catchall = wrapSchemaValue(v3Def.catchall, cache);
  }

  return result;
}

// Recursively add _zod property to a schema for zod-to-ts v2 compatibility
function wrapSchemaForZodToTs(
  schema: any,
  cache: WeakMap<object, any> = new WeakMap()
): any {
  if (!schema || typeof schema !== "object") return schema;

  // Skip if already has _zod (native zod v4)
  if (schema._zod) return schema;

  // Skip if no _def (not a zod schema)
  if (!schema._def) return schema;

  // Check cache to handle circular references
  if (cache.has(schema)) {
    return cache.get(schema);
  }

  // Create wrapped schema with _zod property
  const wrapped = Object.create(Object.getPrototypeOf(schema));
  cache.set(schema, wrapped);

  // Copy all own properties from original
  Object.assign(wrapped, schema);

  // Add _zod property
  Object.defineProperty(wrapped, "_zod", {
    get() {
      return {
        def: createV4CompatDef(schema._def, cache),
        optin: false,
        optout: schema.isOptional?.() ?? false,
      };
    },
    configurable: true,
    enumerable: false,
  });

  return wrapped;
}

function zodToString(schema: ZodTypeAny) {
  // Wrap the schema to add _zod property for zod-to-ts v2 compatibility
  const wrappedSchema = wrapSchemaForZodToTs(schema);

  // zod-to-ts v2 API: zodToTs(schema, options)
  const auxiliaryTypeStore = createAuxiliaryTypeStore();
  const { node } = zodToTs(wrappedSchema as any, { auxiliaryTypeStore });
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
