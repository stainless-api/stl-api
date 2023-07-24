import { z, type AnyAPIDescription, type AnyEndpoint, type AnyResourceConfig, type ResourceConfig, type HttpMethod, type EndpointPathInput, type GetEndpointMethod, APIRouteMap } from "stainless";
import { ContextOptions } from "@tanstack/react-query";
import { type UpperFirst } from "./util";
import { ClientUseQuery, UseQueryOptions } from "./useQuery";
import { ClientUseMutation, UseMutationOptions } from "./useMutation";
import { ClientUseInfiniteQueryHooks, UseInfiniteQueryOptions, UseItem, UseItemResult } from "./useInfiniteQuery";
import { ClientPromise, ClientPromiseProps } from "./ClientPromise";
import { PaginatorPromise } from "./PaginatorPromise";
import { ClientMethods } from "./ClientMethod";
export { ClientPromise, ClientPromiseProps, PaginatorPromise, UseQueryOptions, UseInfiniteQueryOptions, UseMutationOptions, UseItem, UseItemResult, };
export type ValueOf<T extends object> = T[keyof T];
export type EndpointPathParam<E extends AnyEndpoint> = EndpointPathInput<E> extends object ? ValueOf<EndpointPathInput<E>> : undefined;
export type StainlessReactQueryClient<Api extends AnyAPIDescription> = ClientResource<ResourceConfig<Api["topLevel"]["actions"], Api["resources"], Api["topLevel"]["models"]>>;
export type UseStainlessReactQueryClientOptions = {
    reactQueryContext?: ContextOptions["context"];
};
export type UseStainlessReactQueryClient<Api extends AnyAPIDescription> = (options?: UseStainlessReactQueryClientOptions) => StainlessReactQueryClient<Api>;
export type ClientResource<Resource extends AnyResourceConfig> = ClientMethods<Resource> & ClientUseQueryAndMutationHooks<Resource> & ClientUseInfiniteQueryHooks<Resource> & {
    [S in keyof Resource["namespacedResources"]]: ClientResource<Resource["namespacedResources"][S]>;
};
type ClientUseQueryAndMutationHooks<Resource extends AnyResourceConfig> = {
    [Action in keyof Resource["actions"] & string as UseAction<Action>]: GetEndpointMethod<Resource["actions"][Action]> extends "get" ? ClientUseQuery<Resource["actions"][Action]> : ClientUseMutation<Resource["actions"][Action]>;
};
type UseAction<Action extends string> = `use${UpperFirst<Action>}`;
export type ActionsForMethod<Resource extends AnyResourceConfig, Method extends HttpMethod> = {
    [Action in keyof Resource["actions"] & string]: GetEndpointMethod<Resource["actions"][Action]> extends Method ? Action : never;
}[keyof Resource["actions"] & string];
export type IsPaginatedEndpoint<EC extends AnyEndpoint> = z.infer<EC["response"]> extends z.PageData<any> ? true : false;
export type PaginatedActions<Resource extends AnyResourceConfig> = {
    [Action in keyof Resource["actions"] & string]: IsPaginatedEndpoint<Resource["actions"][Action]> extends true ? Action : never;
}[keyof Resource["actions"] & string];
export type Headers = Record<string, string | null | undefined>;
export type KeysEnum<T> = {
    [P in keyof Required<T>]: true;
};
export declare function createUseReactQueryClient<Api extends AnyAPIDescription>(baseUrl: string, options?: {
    fetch?: typeof fetch;
    routeMap?: APIRouteMap;
    basePathMap?: Record<string, string>;
}): UseStainlessReactQueryClient<Api>;
//# sourceMappingURL=index.d.ts.map