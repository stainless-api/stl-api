import { z, AnyAPIDescription, AnyEndpoint, AnyResourceConfig, ResourceConfig, HttpMethod } from "./stl";
type ValueOf<T extends object> = T[keyof T];
type ExtractClientPath<E extends AnyEndpoint> = E["path"] extends z.ZodTypeAny ? ValueOf<z.input<E["path"]>> : undefined;
type ExtractClientQuery<E extends AnyEndpoint> = E["query"] extends z.ZodTypeAny ? z.input<E["query"]> : undefined;
type ExtractClientBody<E extends AnyEndpoint> = E["body"] extends z.ZodTypeAny ? z.input<E["body"]> : undefined;
type CapitalLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
type ListAction = `list${`${CapitalLetter | "_"}${string}` | ""}`;
type ExtractClientResponse<Action, E extends AnyEndpoint> = Action extends ListAction ? z.infer<E["response"]> extends z.PageData<any> ? PaginatorPromise<z.infer<E["response"]>> : ExtractClientResponse<unknown, E> : E["response"] extends z.ZodTypeAny ? ClientPromise<z.infer<E["response"]>> : ClientPromise<undefined>;
export type StainlessClient<Api extends AnyAPIDescription> = ClientResource<ResourceConfig<Api["topLevel"]["actions"], Api["resources"], Api["topLevel"]["models"]>>;
type ClientResource<Resource extends AnyResourceConfig> = {
    [Action in keyof Resource["actions"]]: Resource["actions"][Action] extends AnyEndpoint ? ClientFunction<Action, Resource["actions"][Action]> : never;
} & {
    [S in keyof Resource["namespacedResources"]]: ClientResource<Resource["namespacedResources"][S]>;
};
type ClientFunction<Action, E extends AnyEndpoint> = E["path"] extends z.ZodTypeAny ? E["body"] extends z.ZodTypeAny ? (path: ExtractClientPath<E>, body: ExtractClientBody<E>, options?: {
    query?: ExtractClientQuery<E>;
}) => ExtractClientResponse<Action, E> : E["query"] extends z.ZodTypeAny ? (path: ExtractClientPath<E>, query: ExtractClientQuery<E>) => ExtractClientResponse<Action, E> : (path: ExtractClientPath<E>) => ExtractClientResponse<Action, E> : E["body"] extends z.ZodTypeAny ? (body: ExtractClientBody<E>, options?: {
    query?: ExtractClientQuery<E>;
}) => ExtractClientResponse<Action, E> : E["query"] extends z.ZodTypeAny ? (query: ExtractClientQuery<E>) => ExtractClientResponse<Action, E> : () => ExtractClientResponse<Action, E>;
export declare function createClient<Api extends AnyAPIDescription>(baseUrl: string): StainlessClient<Api>;
export type Headers = Record<string, string | null | undefined>;
export type KeysEnum<T> = {
    [P in keyof Required<T>]: true;
};
export type RequestOptions<Req extends {} = Record<string, unknown>> = {
    method?: HttpMethod;
    path?: string;
    query?: Req | undefined;
    body?: Req | undefined;
    headers?: Headers | undefined;
    maxRetries?: number;
    stream?: boolean | undefined;
    timeout?: number;
    idempotencyKey?: string;
};
export declare const isRequestOptions: (obj: unknown) => obj is RequestOptions<Record<string, unknown>>;
export type Page<D extends z.PageData<any>> = PageImpl<D> & D;
export declare class PageImpl<D extends z.PageData<any>> {
    private client;
    private clientPath;
    private pathname;
    private params;
    private data;
    constructor(client: StainlessClient<any>, clientPath: string[], pathname: string, params: z.infer<typeof z.PaginationParams>, data: D);
    items: z.PageItemType<D>[];
    startCursor: string | null;
    endCursor: string | null;
    hasNextPage: boolean | undefined;
    hasPreviousPage: boolean | undefined;
    getPreviousPageParams(): z.PaginationParams;
    getPreviousPageParam(): string | null;
    getPreviousPageUrl(): string;
    getPreviousPage(): Promise<Page<D>>;
    getNextPageParams(): z.PaginationParams;
    getNextPageParam(): string | null;
    getNextPageUrl(): string;
    getNextPage(): Promise<Page<D>>;
}
type ClientPromiseProps = {
    method: HttpMethod;
    uri: string;
    pathname: string;
    search: string;
    query: Record<string, any>;
    cacheKey: string;
};
declare class ClientPromise<R> implements Promise<R> {
    fetch: () => Promise<R>;
    method: HttpMethod;
    uri: string;
    pathname: string;
    search: string;
    query: Record<string, any>;
    cacheKey: string;
    constructor(fetch: () => Promise<R>, props: ClientPromiseProps);
    then<TResult1 = R, TResult2 = never>(onfulfilled?: ((value: R) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<R | TResult>;
    finally(onfinally?: (() => void) | undefined | null): Promise<R>;
    get [Symbol.toStringTag](): string;
}
export type { ClientPromise };
/**
 * The result of client.???.list, can be awaited like a
 * Promise to get a single page, or async iterated to go through
 * all items
 */
declare class PaginatorPromise<D extends z.PageData<any>> extends ClientPromise<Page<D>> implements AsyncIterable<z.PageItemType<D>> {
    constructor(fetch: () => Promise<Page<D>>, props: ClientPromiseProps);
    [Symbol.asyncIterator](): AsyncIterator<z.PageItemType<D>>;
    get [Symbol.toStringTag](): string;
}
export type { PaginatorPromise };
//# sourceMappingURL=client.d.ts.map