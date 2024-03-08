import { z, AnyAPIDescription, AnyEndpoint, AnyResourceConfig, ResourceConfig, HttpMethod, APIRouteMap, EndpointPathInput, EndpointBodyInput, EndpointQueryInput, HttpPath, HttpEndpoint, EndpointHasRequiredQuery } from "./stl";
type ValueOf<T extends object> = T[keyof T];
type EndpointPathParam<E extends AnyEndpoint> = EndpointPathInput<E> extends object ? ValueOf<EndpointPathInput<E>> : undefined;
type ExtractClientResponse<E extends AnyEndpoint> = E["response"] extends z.ZodTypeAny ? z.infer<E["response"]> extends z.PageData<any> ? PaginatorPromise<z.infer<E["response"]>> : ClientPromise<z.infer<E["response"]>> : ClientPromise<undefined>;
/**
 * A client for making requests to the REST API described by the `Api` type.
 *
 * The client allows for performing REST operations idiomatically by utilizing
 * the resources and endpoints declared on the API. A resource's endpoints
 * are available on the client as methods on a field with the name of the
 * resource.
 *
 * ## Example
 * ```ts
 * // api/users/index.ts
 * import { stl } from "~/libs/stl";
 * import { retrieve } from "./retrieve";
 * import { User } from "./models";
 *
 * export const users = stl.resource({
 *   summary: "Users",
 *   models: {
 *     User,
 *   },
 *   actions: {
 *     retrieve,
 *   },
 * });
 *
 * // app/users/[userId]/page.tsx
 * ...
 * // `users` refers to the resource by the same name, `retrieve` refers
 * // to the endpoint on `users` by the same name
 * const user = client.users.retrieve(userId);
 * ...
 *
 * ## Implementation note
 * In order to decrease build times and bundle sizes, the
 * `stainless` client utilizes proxies in order to provide a mapping
 * to the server API. This means that resource and endpoint fields and methods
 * cannot be found within source code. Autocomplete and type definitions
 * within a Typescript LSP-enabled editor are good ways of understanding
 * the shape of the client API.
 * ```
 */
export type StainlessClient<Api extends AnyAPIDescription> = ClientResource<ResourceConfig<Api["topLevel"]["actions"], Api["resources"], Api["topLevel"]["models"]>>;
type ClientResource<Resource extends AnyResourceConfig> = (string extends keyof Resource["actions"] ? {} : {
    [Action in keyof Resource["actions"]]: Resource["actions"][Action] extends AnyEndpoint ? ClientFunction<Resource["actions"][Action]> : never;
}) & {
    [S in keyof Resource["namespacedResources"]]: ClientResource<Resource["namespacedResources"][S]>;
};
type ClientFunction<E extends AnyEndpoint> = E["path"] extends z.ZodTypeAny ? E["body"] extends z.ZodTypeAny ? EndpointHasRequiredQuery<E> extends true ? (path: EndpointPathParam<E>, body: EndpointBodyInput<E>, options: RequestOptions<EndpointQueryInput<E>>) => ExtractClientResponse<E> : (path: EndpointPathParam<E>, body: EndpointBodyInput<E>, options?: RequestOptions<EndpointQueryInput<E>>) => ExtractClientResponse<E> : E["query"] extends z.ZodTypeAny ? EndpointHasRequiredQuery<E> extends true ? (path: EndpointPathParam<E>, query: EndpointQueryInput<E>, options?: RequestOptions) => ExtractClientResponse<E> : (path: EndpointPathParam<E>, query?: EndpointQueryInput<E>, options?: RequestOptions) => ExtractClientResponse<E> : (path: EndpointPathParam<E>, options?: RequestOptions) => ExtractClientResponse<E> : E["body"] extends z.ZodTypeAny ? EndpointHasRequiredQuery<E> extends true ? (body: EndpointBodyInput<E>, options: RequestOptions<EndpointQueryInput<E>>) => ExtractClientResponse<E> : (body: EndpointBodyInput<E>, options?: RequestOptions<EndpointQueryInput<E>>) => ExtractClientResponse<E> : E["query"] extends z.ZodTypeAny ? EndpointHasRequiredQuery<E> extends true ? (query: EndpointQueryInput<E>, options?: RequestOptions) => ExtractClientResponse<E> : (query?: EndpointQueryInput<E>, options?: RequestOptions) => ExtractClientResponse<E> : (options?: RequestOptions) => ExtractClientResponse<E>;
/** Options for the {@link createClient} function. */
export type CreateClientOptions = {
    fetch?: typeof fetch;
    routeMap?: APIRouteMap;
    basePathMap?: Record<string, string>;
};
export declare function guessRequestEndpoint(baseUrl: HttpPath, callPath: string[], action: string): HttpEndpoint;
/**
 * Creates a client for making requests against a `stainless` framework API.
 * For usage information see {@link StainlessClient}.
 *
 * @param baseUrl the url to prepend to all request paths
 * @param options options to customize client behavior
 * @returns client
 *
 * ## Example
 * ```ts
 * // ~/api/client.ts
 * import { createClient } from "stainless";
 * import type { api } from "./index";
 *
 * export const client = createClient<typeof api>("/api");
 * ```
 *
 * ## Client-server separation
 * In order to get a client with correct typing information, it's necessary
 * to import the type of the API from server-side code. This does not expose
 * server-side code or secrets to users because types are transpile-time
 * constructs. Importing values or functions from server-side code, however,
 * would result in this being included in client-side bundles.
 */
export declare function createClient<Api extends AnyAPIDescription>(baseUrl: string, options?: CreateClientOptions): StainlessClient<Api>;
/** A record of HTTP header names and values. */
export type Headers = Record<string, string | null | undefined>;
export type KeysEnum<T> = {
    [P in keyof Required<T>]: true;
};
/**
 * Request options to customize the behavior of a
 * {@link StainlessClient} request.
 */
export type RequestOptions<Req extends {} | undefined = undefined> = {
    /** Override the method with which to perform the request. */
    /** Override the path at which to make the request. */
    /** Provide query parameters for the request. */
    query?: Req | undefined;
    /** Provide body parameters for the request. */
    /** Provide HTTP headers to send with the request. */
    headers?: Headers | undefined;
};
/** Fetched page data, along with associated pagination state. */
export type Page<D extends z.PageData<any>> = PageImpl<D> & D;
export declare class PageImpl<D extends z.PageData<any>> {
    private client;
    private clientPath;
    private pathname;
    private params;
    data: D;
    constructor(client: StainlessClient<any>, clientPath: string[], pathname: string, params: z.infer<typeof z.PaginationParams>, data: D);
    /** The items in a page. */
    items: z.PageItemType<D>[];
    /** The cursor referring to the first element in the page, if present. */
    startCursor: string | null;
    /**
     * The cursor referring to the one past the last element in the page,
     * if present.
     */
    endCursor: string | null;
    /** If known, whether there is a page after the current one. */
    hasNextPage: boolean | undefined;
    /** If known, whether there is a page before the current one. */
    hasPreviousPage: boolean | undefined;
    /**
     * Get params to access previous page.
     * @throws if there is no `startCursor`.
     */
    getPreviousPageParams(): z.PaginationParams;
    /** Gets the cursor to access the previous page. */
    getPreviousPageParam(): string | null;
    /**
     * Gets the URL at which to access the previous page.
     * @throws if there is no `startCursor`.
     */
    getPreviousPageUrl(): string;
    /**
     * Gets the previous page.
     * @throws if there is no `startCursor`.
     */
    getPreviousPage(): Promise<Page<D>>;
    /**
     * Get params to access the next page.
     * @throws if there is no `endCursor`.
     */
    getNextPageParams(): z.PaginationParams;
    /** Gets the cursor to access the next page. */
    getNextPageParam(): string | null;
    /**
     * Gets the URL at which to access the next page.
     * @throws if there is no `endCursor`.
     */
    getNextPageUrl(): string;
    /**
     * Gets the next page.
     * @throws if there is no `endCursor`.
     */
    getNextPage(): Promise<Page<D>>;
}
export type ClientPromiseProps = {
    method: HttpMethod;
    uri: string;
    pathname: string;
    search: string;
    query: Record<string, any>;
};
/** A promise returned by {@link StainlessClient} requests. */
export declare class ClientPromise<R> implements Promise<R> {
    fetch: () => Promise<R>;
    method: HttpMethod;
    uri: string;
    pathname: string;
    search: string;
    query: Record<string, any>;
    constructor(fetch: () => Promise<R>, props: ClientPromiseProps);
    then<TResult1 = R, TResult2 = never>(onfulfilled?: ((value: R) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<R | TResult>;
    finally(onfinally?: (() => void) | undefined | null): Promise<R>;
    get [Symbol.toStringTag](): string;
}
/**
 * The result of client.???.list, can be awaited like a
 * `Promise` to get a single page, or async iterated to go through
 * all items.
 */
export declare class PaginatorPromise<D extends z.PageData<any>> extends ClientPromise<Page<D>> implements AsyncIterable<z.PageItemType<D>> {
    constructor(fetch: () => Promise<Page<D>>, props: ClientPromiseProps);
    [Symbol.asyncIterator](): AsyncIterator<z.PageItemType<D>>;
    get [Symbol.toStringTag](): string;
}
export {};
//# sourceMappingURL=client.d.ts.map