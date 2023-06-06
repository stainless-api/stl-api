import qs from "qs";
import * as React from "react";
import {
  z,
  type AnyAPIDescription,
  type AnyEndpoint,
  type AnyResourceConfig,
  type ResourceConfig,
  type HttpMethod,
  type EndpointPathInput,
  type EndpointBodyInput,
  type EndpointQueryInput,
  type EndpointResponseOutput,
  createRecursiveProxy,
  type GetEndpointMethod,
} from "stainless";
import { isEmpty, once } from "lodash";
import {
  type UseQueryOptions as BaseUseQueryOptions,
  type UseQueryResult,
  useQuery,
  type UseInfiniteQueryOptions as BaseUseInfiniteQueryOptions,
  type UseInfiniteQueryResult as BaseUseInfiniteQueryResult,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { type UpperFirst } from "./util";

type ValueOf<T extends object> = T[keyof T];

type EndpointPathParam<E extends AnyEndpoint> =
  EndpointPathInput<E> extends object
    ? ValueOf<EndpointPathInput<E>>
    : undefined;

type ExtractClientResponse<E extends AnyEndpoint> = z.infer<
  E["response"]
> extends z.PageData<any>
  ? PaginatorPromise<z.infer<E["response"]>>
  : E["response"] extends z.ZodTypeAny
  ? ClientPromise<z.infer<E["response"]>>
  : ClientPromise<undefined>;

export type StainlessReactQueryClient<Api extends AnyAPIDescription> =
  ClientResource<
    ResourceConfig<
      Api["topLevel"]["actions"],
      Api["resources"],
      Api["topLevel"]["models"]
    >
  >;

type UseAction<Action extends string> = `use${UpperFirst<Action>}`;
type UseInfiniteAction<Action extends string> =
  `useInfinite${UpperFirst<Action>}`;

type ActionsForMethod<
  Resource extends AnyResourceConfig,
  Method extends HttpMethod
> = {
  [Action in keyof Resource["actions"] & string]: GetEndpointMethod<
    Resource["actions"][Action]
  > extends Method
    ? Action
    : never;
}[keyof Resource["actions"] & string];

export type IsPaginatedEndpoint<EC extends AnyEndpoint> = z.infer<
  EC["response"]
> extends z.PageData<any>
  ? true
  : false;

export type PaginatedActions<Resource extends AnyResourceConfig> = {
  [Action in keyof Resource["actions"] & string]: IsPaginatedEndpoint<
    Resource["actions"][Action]
  > extends true
    ? Action
    : never;
}[keyof Resource["actions"] & string];

export type ClientResource<Resource extends AnyResourceConfig> = {
  [Action in keyof Resource["actions"]]: Resource["actions"][Action] extends AnyEndpoint
    ? ClientFunction<Resource["actions"][Action]>
    : never;
} & {
  [Action in ActionsForMethod<
    Resource,
    "get"
  > as UseAction<Action>]: ClientUseQuery<Resource["actions"][Action]>;
} & {
  [Action in PaginatedActions<Resource> as UseInfiniteAction<Action>]: ClientUseInfiniteQuery<
    Resource["actions"][Action]
  >;
} & {
  [S in keyof Resource["namespacedResources"]]: ClientResource<
    Resource["namespacedResources"][S]
  >;
};

type ClientFunction<E extends AnyEndpoint> = E["path"] extends z.ZodTypeAny
  ? E["body"] extends z.ZodTypeAny
    ? (
        path: EndpointPathParam<E>,
        body: EndpointBodyInput<E>,
        options?: RequestOptions<EndpointQueryInput<E>>
      ) => ExtractClientResponse<E>
    : E["query"] extends z.ZodTypeAny
    ? (
        path: EndpointPathParam<E>,
        query: EndpointQueryInput<E>,
        options?: RequestOptions
      ) => ExtractClientResponse<E>
    : (
        path: EndpointPathParam<E>,
        options?: RequestOptions
      ) => ExtractClientResponse<E>
  : E["body"] extends z.ZodTypeAny
  ? (
      body: EndpointBodyInput<E>,
      options?: RequestOptions<EndpointQueryInput<E>>
    ) => ExtractClientResponse<E>
  : E["query"] extends z.ZodTypeAny
  ? (
      query: EndpointQueryInput<E>,
      options?: RequestOptions
    ) => ExtractClientResponse<E>
  : (options?: RequestOptions) => ExtractClientResponse<E>;

export type Headers = Record<string, string | null | undefined>;
export type KeysEnum<T> = { [P in keyof Required<T>]: true };

export type RequestOptions<Req extends {} | undefined = undefined> = {
  // method?: HttpMethod;
  // path?: string;
  query?: Req;
  // body?: Req | undefined;
  headers?: Headers | undefined;

  // maxRetries?: number;
  // stream?: boolean | undefined;
  // timeout?: number;
  // idempotencyKey?: string;
};

// This is required so that we can determine if a given object matches the RequestOptions
// type at runtime. While this requires duplication, it is enforced by the TypeScript
// compiler such that any missing / extraneous keys will cause an error.
const requestOptionsKeys: KeysEnum<RequestOptions> = {
  // method: true,
  // path: true,
  query: true,
  // body: true,
  headers: true,

  // maxRetries: true,
  // stream: true,
  // timeout: true,
  // idempotencyKey: true,
};

export const isRequestOptions = (obj: unknown): obj is RequestOptions => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    !isEmpty(obj) &&
    Object.keys(obj).every((k) => Object.hasOwn(requestOptionsKeys, k))
  );
};

type ClientUseQuery<
  E extends AnyEndpoint,
  TQueryFnData = EndpointResponseOutput<E>,
  TError = unknown,
  TData = TQueryFnData
> = E["path"] extends z.ZodTypeAny
  ? E["body"] extends z.ZodTypeAny
    ? (
        path: EndpointPathParam<E>,
        body: EndpointBodyInput<E>,
        options?: { query?: EndpointQueryInput<E> } & UseQueryOptions<
          TQueryFnData,
          TError,
          TData
        >
      ) => UseQueryResult<TData, TError>
    : E["query"] extends z.ZodTypeAny
    ? (
        path: EndpointPathParam<E>,
        query: EndpointQueryInput<E>,
        options?: UseQueryOptions<TQueryFnData, TError, TData>
      ) => UseQueryResult<TData, TError>
    : (
        path: EndpointPathParam<E>,
        options?: UseQueryOptions<TQueryFnData, TError, TData>
      ) => UseQueryResult<TData, TError>
  : E["body"] extends z.ZodTypeAny
  ? (
      body: EndpointBodyInput<E>,
      options?: { query?: EndpointQueryInput<E> } & UseQueryOptions<
        TQueryFnData,
        TError,
        TData
      >
    ) => UseQueryResult<TData, TError>
  : E["query"] extends z.ZodTypeAny
  ? (
      query: EndpointQueryInput<E>,
      options?: UseQueryOptions<TQueryFnData, TError, TData>
    ) => UseQueryResult<TData, TError>
  : (
      options?: UseQueryOptions<TQueryFnData, TError, TData>
    ) => UseQueryResult<TData, TError>;

type UseQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData
> = Omit<
  BaseUseQueryOptions<TQueryFnData, TError, TData, any>,
  "queryKey" | "queryFn"
>;

// This is required so that we can determine if a given object matches the RequestOptions
// type at runtime. While this requires duplication, it is enforced by the TypeScript
// compiler such that any missing / extraneous keys will cause an error.
const useQueryOptionsKeys: KeysEnum<{ query?: any } & UseQueryOptions> = {
  context: true,
  retry: true,
  retryDelay: true,
  networkMode: true,
  cacheTime: true,
  isDataEqual: true,
  queryHash: true,
  queryKeyHashFn: true,
  initialData: true,
  initialDataUpdatedAt: true,
  behavior: true,
  structuralSharing: true,
  getPreviousPageParam: true,
  getNextPageParam: true,
  _defaulted: true,
  meta: true,
  query: true,
  enabled: true,
  staleTime: true,
  refetchInterval: true,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchOnMount: true,
  retryOnMount: true,
  notifyOnChangeProps: true,
  onSuccess: true,
  onError: true,
  onSettled: true,
  useErrorBoundary: true,
  select: true,
  suspense: true,
  keepPreviousData: true,
  placeholderData: true,
  _optimisticResults: true,
};

export const isUseQueryOptions = (obj: unknown): obj is BaseUseQueryOptions => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    !isEmpty(obj) &&
    Object.keys(obj).every((k) => Object.hasOwn(useQueryOptionsKeys, k))
  );
};

type ClientUseInfiniteQuery<
  E extends AnyEndpoint,
  TQueryFnData = EndpointResponseOutput<E>,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData
> = E["path"] extends z.ZodTypeAny
  ? E["query"] extends z.ZodTypeAny
    ? (
        path: EndpointPathParam<E>,
        query: EndpointQueryInput<E>,
        options?: UseInfiniteQueryOptions<
          TQueryFnData,
          TError,
          TData,
          TQueryData
        >
      ) => UseInfiniteQueryResult<TData, TError>
    : (
        path: EndpointPathParam<E>,
        options?: UseInfiniteQueryOptions<
          TQueryFnData,
          TError,
          TData,
          TQueryData
        >
      ) => UseInfiniteQueryResult<TData, TError>
  : E["query"] extends z.ZodTypeAny
  ? (
      query: EndpointQueryInput<E>,
      options?: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryData>
    ) => UseInfiniteQueryResult<TData, TError>
  : (
      options?: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryData>
    ) => UseInfiniteQueryResult<TData, TError>;

type UseInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData
> = Omit<
  BaseUseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryData>,
  "queryKey" | "queryFn" | "getNextPageParam" | "getPreviousPageParam"
>;

// This is required so that we can determine if a given object matches the RequestOptions
// type at runtime. While this requires duplication, it is enforced by the TypeScript
// compiler such that any missing / extraneous keys will cause an error.
const useInfiniteQueryOptionsKeys: KeysEnum<UseInfiniteQueryOptions> = {
  context: true,
  retry: true,
  retryDelay: true,
  networkMode: true,
  cacheTime: true,
  isDataEqual: true,
  queryHash: true,
  queryKeyHashFn: true,
  initialData: true,
  initialDataUpdatedAt: true,
  behavior: true,
  structuralSharing: true,
  _defaulted: true,
  meta: true,
  enabled: true,
  staleTime: true,
  refetchInterval: true,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchOnMount: true,
  retryOnMount: true,
  notifyOnChangeProps: true,
  onSuccess: true,
  onError: true,
  onSettled: true,
  useErrorBoundary: true,
  select: true,
  suspense: true,
  keepPreviousData: true,
  placeholderData: true,
  _optimisticResults: true,
};

export const isUseInfiniteQueryOptions = (
  obj: unknown
): obj is BaseUseInfiniteQueryOptions => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    !isEmpty(obj) &&
    Object.keys(obj).every((k) => Object.hasOwn(useInfiniteQueryOptionsKeys, k))
  );
};

export type UseItemResult<Item> =
  | { status: "loading" }
  | { status: "loaded"; data: Item }
  | { status: "error"; error: Error }
  | undefined;

export type UseItem<Item> = (index: number) => UseItemResult<Item>;

type UseInfiniteQueryResult<TData, TError> = BaseUseInfiniteQueryResult<
  TData,
  TError
> & {
  itemCount: number;
  /**
   * This is the itemCount + 1 if hasNextPage, else just
   * the itemCount.
   */
  itemAndPlaceholderCount: number;
  items: z.PageItemType<TData>[];
  useItem: UseItem<z.PageItemType<TData>>;
};

function actionMethod(action: string): HttpMethod {
  if (
    /^(retrieve|get|list|use(Retrieve|(Infinite)?List|Get))([_A-Z]|$)/.test(
      action
    )
  )
    return "get";
  if (/^delete([_A-Z]|$)/.test(action)) return "delete";
  // TODO: is it possible to deal with patch/put?
  return "post";
}

export function createReactQueryClient<Api extends AnyAPIDescription>(
  baseUrl: string,
  options?: { fetch?: typeof fetch }
): StainlessReactQueryClient<Api> {
  const client = createRecursiveProxy((opts) => {
    const callPath = [...opts.path]; // e.g. ["issuing", "cards", "create"]
    const action = callPath.pop()!; // TODO validate
    const { args } = opts;
    const isPaginated = /^(list|use(Infinite)?List)([_A-Z]|$)/.test(action);
    const isInfinite = /^useInfinite([_A-Z]|$)/.test(action);
    const isHook = /^use[_A-Z]/.test(action);

    let requestOptions: RequestOptions<any> | undefined;
    let useQueryOptions: ({ query?: any } & UseQueryOptions) | undefined;

    let path = callPath.join("/"); // eg; /issuing/cards
    if (typeof args[0] === "string" || typeof args[0] === "number") {
      path += `/${encodeURIComponent(args.shift() as string | number)}`;
    }

    if (isHook && isUseQueryOptions(args.at(-1))) {
      useQueryOptions = args.shift() as any;
    }
    if (!isHook && isRequestOptions(args.at(-1))) {
      requestOptions = args.shift() as any;
    }
    const method = actionMethod(action);

    const body = method === "get" ? undefined : args[0];

    const pathname = `${baseUrl}/${path}`;
    let uri = pathname;

    const query: Record<string, any> = {
      ...(method === "get" && typeof args[0] === "object" ? args[0] : null),
      ...(useQueryOptions || requestOptions)?.query,
    };
    let search = "";
    if (query && Object.keys(query).length) {
      search = `?${qs.stringify(query)}`;
      uri += search;
    }

    let queryKey = [...opts.path, query];

    const doFetch = async (moreQuery?: object) => {
      let finalUri = uri;
      if (moreQuery) {
        finalUri = `${pathname}?${qs.stringify({ ...query, ...moreQuery })}`;
      }
      const json = await (options?.fetch || fetch)(finalUri, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...requestOptions?.headers,
        },
        body: body ? JSON.stringify(body) : undefined, // TODO: don't include on GET
      }).then(async (res) => {
        const responsebody = await res.text();
        try {
          return JSON.parse(responsebody);
        } catch (e) {
          console.error("Could not parse json", responsebody);
        }
      });

      if ("error" in json) {
        throw new Error(`Error: ${json.error.message}`);
      }

      const parsed = await z.AnyPageData.safeParseAsync(json);
      if (parsed.success) {
        return new PageImpl(
          client,
          opts.path,
          pathname,
          query as any,
          parsed.data
        );
      }
      return json;
    };

    const promiseProps = {
      method,
      uri,
      pathname,
      search,
      query,
      queryKey,
    };

    if (isInfinite) {
      const result = useInfiniteQuery({
        ...options,
        queryKey,
        queryFn: ({ pageParam }: { pageParam?: string }) =>
          doFetch({
            ...(pageParam
              ? (JSON.parse(pageParam) as {
                  pageAfter?: string;
                  pageBefore?: string;
                })
              : {}),
            ...query,
          }),
        getNextPageParam: (lastPage: z.PageData<any>) =>
          lastPage.endCursor
            ? JSON.stringify({ pageAfter: lastPage.endCursor })
            : undefined,
        getPreviousPageParam: (firstPage: z.PageData<any>) =>
          firstPage.startCursor
            ? JSON.stringify({ pageBefore: firstPage.startCursor })
            : undefined,
      });

      const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = result;
      const pages = data?.pages;

      const items = React.useMemo(
        () => pages?.flatMap((p: any) => p.items) || [],
        [pages]
      );
      const itemCount = items.length;
      const itemAndPlaceholderCount = items.length + (hasNextPage ? 1 : 0);

      /**
       * This is a custom hook for infinite scroll views to use, it gets the
       * item at the given index.  If the index is after the last item and
       * there is more, triggers fetchNextPage and returns a loading placeholder.
       * TODO: evict items at the beginning if the user scrolls far enough
       */
      const useItem = React.useCallback(
        (index: number): UseItemResult<any> => {
          const needNextPage = hasNextPage && index >= items.length;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          React.useEffect(() => {
            if (needNextPage && !isFetchingNextPage) fetchNextPage();
            // eslint-disable-next-line react-hooks/exhaustive-deps
          }, [needNextPage, isFetchingNextPage]);

          if (items[index]) return { status: "loaded", data: items[index] };
          if (hasNextPage && index === items.length) {
            return { status: "loading" };
          }
        },
        [items, hasNextPage, isFetchingNextPage, fetchNextPage]
      );

      return React.useMemo(
        () => ({
          ...result,
          items,
          itemCount,
          itemAndPlaceholderCount,
          useItem,
        }),
        [result, items, itemCount, itemAndPlaceholderCount, useItem]
      );
    }
    if (isHook) {
      return useQuery({
        ...useQueryOptions,
        queryKey,
        queryFn: doFetch,
      });
    }

    return isPaginated
      ? new PaginatorPromise(doFetch, promiseProps)
      : new ClientPromise(doFetch, promiseProps);
  }, []) as StainlessReactQueryClient<Api>;
  return client;
}

export type Page<D extends z.PageData<any>> = PageImpl<D> & D;

export class PageImpl<D extends z.PageData<any>> {
  constructor(
    private client: StainlessReactQueryClient<any>,
    private clientPath: string[],
    private pathname: string,
    private params: z.infer<typeof z.PaginationParams>,
    public data: D
  ) {
    Object.assign(this, data);
  }

  declare items: z.PageItemType<D>[];
  declare startCursor: string | null;
  declare endCursor: string | null;
  declare hasNextPage: boolean | undefined;
  declare hasPreviousPage: boolean | undefined;

  getPreviousPageParams(): z.PaginationParams {
    const { startCursor } = this.data;
    if (startCursor == null) {
      throw new Error(
        `response doesn't have startCursor, can't get previous page`
      );
    }
    const {
      pageSize,
      sortBy,
      sortDirection,
      // eslint-disable-next-line no-unused-vars
      pageAfter: _pageAfter,
      // eslint-disable-next-line no-unused-vars
      pageBefore: _pageBefore,
      ...rest
    } = this.params;
    return {
      ...rest,
      pageSize,
      sortBy,
      sortDirection,
      pageBefore: startCursor,
    };
  }

  getPreviousPageParam(): string | null {
    return this.data.startCursor;
  }

  getPreviousPageUrl(): string {
    return `${this.pathname}/${qs.stringify(this.getPreviousPageParams())}`;
  }

  async getPreviousPage(): Promise<Page<D>> {
    return await this.clientPath
      .reduce((client: any, path) => client[path], this.client)
      .list(this.getPreviousPageParams());
  }

  getNextPageParams(): z.PaginationParams {
    const { endCursor } = this.data;
    if (endCursor == null) {
      throw new Error(`response doesn't have endCursor, can't get next page`);
    }
    const {
      pageSize,
      sortBy,
      sortDirection,
      // eslint-disable-next-line no-unused-vars
      pageAfter: _pageAfter,
      // eslint-disable-next-line no-unused-vars
      pageBefore: _pageBefore,
      ...rest
    } = this.params;
    return {
      ...rest,
      pageSize,
      sortBy,
      sortDirection,
      pageAfter: endCursor,
    };
  }

  getNextPageParam(): string | null {
    return this.data.endCursor;
  }

  getNextPageUrl(): string {
    return `${this.pathname}/${qs.stringify(this.getNextPageParams())}`;
  }

  async getNextPage(): Promise<Page<D>> {
    return await this.clientPath
      .reduce((client: any, path) => client[path], this.client)
      .list(this.getNextPageParams());
  }
}

type ClientPromiseProps = {
  method: HttpMethod;
  uri: string;
  pathname: string;
  search: string;
  query: Record<string, any>;
  queryKey: readonly unknown[];
};

class ClientPromise<R> implements Promise<R> {
  fetch: () => Promise<R>;
  method: HttpMethod;
  uri: string;
  pathname: string;
  search: string;
  query: Record<string, any>;
  queryKey: readonly unknown[];

  constructor(fetch: () => Promise<R>, props: ClientPromiseProps) {
    this.fetch = once(fetch);
    this.method = props.method;
    this.uri = props.uri;
    this.pathname = props.pathname;
    this.search = props.search;
    this.query = props.query;
    this.queryKey = props.queryKey;
  }

  then<TResult1 = R, TResult2 = never>(
    onfulfilled?:
      | ((value: R) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    return this.fetch().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<R | TResult> {
    return this.fetch().catch(onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null): Promise<R> {
    return this.fetch().finally(onfinally);
  }

  get [Symbol.toStringTag]() {
    return "ClientPromise";
  }
}

export type { ClientPromise };

/**
 * The result of client.???.list, can be awaited like a
 * Promise to get a single page, or async iterated to go through
 * all items
 */
class PaginatorPromise<D extends z.PageData<any>>
  extends ClientPromise<Page<D>>
  implements AsyncIterable<z.PageItemType<D>>
{
  constructor(fetch: () => Promise<Page<D>>, props: ClientPromiseProps) {
    super(fetch, props);
  }

  async *[Symbol.asyncIterator](): AsyncIterator<z.PageItemType<D>> {
    let page: Page<D> | undefined = await this;
    while (page) {
      yield* page.items;
      page = page.hasNextPage ? await page.getNextPage() : undefined;
    }
  }

  get [Symbol.toStringTag]() {
    return "PaginatorPromise";
  }
}

export type { PaginatorPromise };
