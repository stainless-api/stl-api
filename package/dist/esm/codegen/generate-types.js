var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { printNode, zodToTs } from "zod-to-ts";
import { splitPathIntoParts } from "../core/endpoint";
import { camelCase, capitalize } from "../util/strings";
import dedent from "dedent-js";
import prettier from "prettier";
import * as _ from "lodash";
function getResources(resources, path) {
    return Object.entries(resources).flatMap((_a) => {
        var [resourceName, _b] = _a, { namespacedResources } = _b, resource = __rest(_b, ["namespacedResources"]);
        const resourcePath = path ? [path, resourceName].join(".") : resourceName;
        if (namespacedResources) {
            return [
                { resourceName, resourcePath, resource },
                ...getResources(namespacedResources, resourcePath),
            ];
        }
        return [{ resourceName, resourcePath, resource }];
    });
}
function getEndpoints(resources) {
    return resources.flatMap(({ resourcePath, resource }) => Object.entries(resource.actions).map(([actionName, action]) => {
        const actionPath = [resourcePath, actionName].join(".");
        return {
            actionName,
            actionPath,
            endpoint: action === null || action === void 0 ? void 0 : action.endpoint,
            pathParts: [
                ...splitPathIntoParts(action.endpoint).map((a) => (Object.assign(Object.assign({}, a), { actionPath }))),
                { type: "action", name: actionName, actionPath },
            ],
            pathParams: action === null || action === void 0 ? void 0 : action.path,
            body: action === null || action === void 0 ? void 0 : action.body,
            query: action === null || action === void 0 ? void 0 : action.query,
            handler: action === null || action === void 0 ? void 0 : action.handler,
            response: action === null || action === void 0 ? void 0 : action.response,
        };
    }));
}
function recursiveSet(obj = {}, items) {
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
        const existingIndex = obj[current.name].asParam.findIndex((param) => {
            return Object.keys(param).includes(key);
        });
        if (existingIndex > -1) {
            obj[current.name].asParam[existingIndex] = _.merge(obj[current.name].asParam[existingIndex], returnValue);
        }
        else {
            obj[current.name].asParam = [...obj[current.name].asParam, returnValue];
        }
        return;
    }
}
function nestEndpoints(endpoints, basePath = "") {
    const api = {};
    endpoints.forEach((endpoint) => {
        const filterdPathParts = endpoint.pathParts.filter((pathPart) => pathPart.name !== basePath.replace("/", ""));
        recursiveSet(api, filterdPathParts);
    });
    return api;
}
function zodToString(schema) {
    const { node } = zodToTs(schema);
    const nodeString = printNode(node);
    // This happens with large, lazyily loaded zod types
    return nodeString.replaceAll(" Identifier ", " unknown ");
}
function makeParameterType(name, value, api, config) {
    const types = [`(${camelCase(name)}: string | number): {`];
    value
        .map((v) => makeTypesFromApiMap(v, api, config))
        .forEach((subTypes) => {
        types.push(...subTypes);
    });
    types.push("};");
    return types;
}
function makeResourceType(name, value, api, config) {
    const subTypes = [];
    Object.entries(value).forEach(([k, v]) => {
        const entryTypes = makeTypesFromApiMap({ [k]: v }, api, config);
        subTypes.push(...entryTypes);
    });
    return [`${camelCase(name)}: {`, ...subTypes, "};"];
}
function makeActionType(name, actionPath, api, config) {
    const resources = actionPath.split(".");
    const action = api.resources[resources[0]].actions[resources[1]];
    const types = [];
    const body = action.body ? `body: ${zodToString(action.body)}` : "";
    const returnType = action.response ? zodToString(action.response) : "void";
    types.push(dedent `
    use${capitalize(camelCase(name))}(${body}): {
      queryFn(): Promise<${returnType}>;
      queryKey: string[];
    };`);
    if (config.extensions) {
        if (action.body) {
            const input = zodToString(action.body);
            types.push(dedent `
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
          ): ReactQuery.UseMutationResult<${returnType}, unknown, ${input}>;
          getQueryKey(): string[];
          };`);
        }
        else {
            types.push(dedent `
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
          ): ReactQuery.UseMutationResult<${returnType}, unknown, void>;
          getQueryKey(): string[];
          };`);
        }
    }
    else {
        types.push(`${camelCase(name)}(${body}): Promise<`);
        types.push(`${returnType}`);
        types.push(">;");
    }
    return types;
}
function makeTypesFromApiMap(apiMap, api, config) {
    const types = [];
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
function makeTypes(apiMap, api, config, installLocation, reactQueryAlias) {
    const output = [];
    output.push(dedent `
    /* eslint-disable prettier/prettier */
    // This is an auto-generated file, any manual changes will be overwritten.
    import { ClientConfig, makeClientWithExplicitTypes } from "${installLocation}";
  `);
    if (config.extensions) {
        output.push(dedent `
      // React-query extension related types
      import * as ReactQuery from "${reactQueryAlias}";

      type StlApiProvidedOpts = "queryFn" | "queryKey" | "mutationFn";
      type UseQueryOptions = Omit<ReactQuery.UseQueryOptions, StlApiProvidedOpts>;
      type UseMutationOptions = Omit<ReactQuery.UseMutationOptions, StlApiProvidedOpts>;

    `);
    }
    output.push(dedent `
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
export function generateOutput(api, config, installLocation = "@stl-api/client", reactQueryAlias = "@tanstack/react-query") {
    return __awaiter(this, void 0, void 0, function* () {
        const resources = getResources(api.resources);
        const endpoints = getEndpoints(resources);
        const apiMap = nestEndpoints(endpoints, config.basePath);
        const output = makeTypes(apiMap, api, config, installLocation, reactQueryAlias);
        return yield prettier.format(output.flat().join("\n"));
    });
}
//# sourceMappingURL=generate-types.js.map