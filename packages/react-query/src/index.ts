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
  createClient,
  type ClientPromiseProps as BaseClientPromiseProps,
  ClientPromise as BaseClientPromise,
  PaginatorPromise as BasePaginatorPromise,
  type Page,
  type RequestOptions,
} from "stainless";
import { isEmpty, lowerFirst } from "lodash";
import {
  type UseQueryOptions as BaseUseQueryOptions,
  type UseQueryResult,
  useQuery,
  type UseInfiniteQueryOptions as BaseUseInfiniteQueryOptions,
  type UseInfiniteQueryResult as BaseUseInfiniteQueryResult,
  useInfiniteQuery,
  QueryClient,
} from "@tanstack/react-query";
import { type UpperFirst } from "./util";

type ValueOf<T extends object> = T[keyof T];

type EndpointPathParam<E extends AnyEndpoint> =
  EndpointPathInput<E> extends object
    ? ValueOf<EndpointPathInput<E>>
    : undefined;

export type StainlessReactQueryClient<Api extends AnyAPIDescription> =
  ClientResource<
    ResourceConfig<
      Api["topLevel"]["actions"],
      Api["resources"],
      Api["topLevel"]["models"]
    >
  >;

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
  [Action in ActionsForMethod<
    Resource,
    "get"
  > as InvalidateAction<Action>]: ClientInvalidateQueries<
    Resource["actions"][Action]
  >;
} & {
  [Action in PaginatedActions<Resource> as UseInfiniteAction<Action>]: ClientUseInfiniteQuery<
    Resource["actions"][Action]
  >;
} & {
  [S in keyof Resource["namespacedResources"]]: ClientResource<
    Resource["namespacedResources"][S]
  >;
} & {
  invalidateQueries(client: QueryClient): void;
};

type UseAction<Action extends string> = `use${UpperFirst<Action>}`;
type UseInfiniteAction<Action extends string> =
  `useInfinite${UpperFirst<Action>}`;
type InvalidateAction<Action extends string> =
  `invalidate${UpperFirst<Action>}`;

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

type ExtractClientResponse<E extends AnyEndpoint> = z.infer<
  E["response"]
> extends z.PageData<any>
  ? PaginatorPromise<z.infer<E["response"]>>
  : E["response"] extends z.ZodTypeAny
  ? ClientPromise<z.infer<E["response"]>>
  : ClientPromise<undefined>;

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

type ClientInvalidateQueries<E extends AnyEndpoint> =
  E["path"] extends z.ZodTypeAny
    ? E["body"] extends z.ZodTypeAny
      ? (
          queryClient: QueryClient,
          path?: EndpointPathParam<E>,
          body?: EndpointBodyInput<E>,
          options?: { query?: EndpointQueryInput<E> }
        ) => void
      : E["query"] extends z.ZodTypeAny
      ? (
          queryClient: QueryClient,
          path?: EndpointPathParam<E>,
          query?: EndpointQueryInput<E>
        ) => void
      : (queryClient: QueryClient, path?: EndpointPathParam<E>) => void
    : E["body"] extends z.ZodTypeAny
    ? (
        queryClient: QueryClient,
        body?: EndpointBodyInput<E>,
        options?: { query?: EndpointQueryInput<E> }
      ) => void
    : E["query"] extends z.ZodTypeAny
    ? (queryClient: QueryClient, query?: EndpointQueryInput<E>) => void
    : (queryClient: QueryClient) => void;

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
    /^(get|retrieve|list|use(Get|Retrieve|(Infinite)?List))([_A-Z]|$)/.test(
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
  const baseClient = createClient<Api>(baseUrl, options);

  const client = createRecursiveProxy((opts) => {
    const args = [...opts.args];
    const callPath = [...opts.path]; // e.g. ["issuing", "cards", "create"]
    const action = callPath.pop()!; // TODO validate

    if (action === "invalidateQueries") {
      return (client: QueryClient) =>
        client.invalidateQueries({ queryKey: [...callPath] });
    }

    const isHook = /^use[_A-Z]/.test(action);
    const isInvalidate = /^invalidate[_A-Z]/.test(action);

    if (!isHook && !isInvalidate) {
      const baseMethod = opts.path.reduce(
        (acc: any, elem: string) => acc[elem],
        baseClient
      );
      return baseMethod(...args);
    }

    const isInfinite = /^useInfinite([_A-Z]|$)/.test(action);

    const queryClient = isInvalidate ? args.shift() : undefined;

    const baseAction = lowerFirst(
      action.replace(/^invalidate|use(Infinite)?/, "")
    );
    const method = actionMethod(action);

    const useQueryOptions: ({ query?: any } & UseQueryOptions) | undefined =
      isUseQueryOptions(args.at(-1)) ? (args.pop() as any) : undefined;
    const query: Record<string, any> = useQueryOptions?.query;

    const queryKey = [...callPath, ...(query ? [query] : [])];

    if (isInvalidate) {
      if (!(queryClient instanceof QueryClient)) {
        throw new Error(
          `the first argument to ${action} must be a QueryClient instance`
        );
      }
      queryClient.invalidateQueries({ queryKey });
      return;
    }

    const doFetch = (moreQuery?: object): ClientPromise<any> => {
      const finalArgs = [...args];
      if (query || moreQuery) {
        const lastArg = finalArgs.at(-1);
        if (
          method === "get" &&
          typeof lastArg === "object" &&
          lastArg != null
        ) {
          finalArgs[finalArgs.length - 1] = {
            ...lastArg,
            ...query,
            ...moreQuery,
          };
        } else {
          finalArgs.push({ query: { ...query, ...moreQuery } });
        }
      }

      const basePromise: BaseClientPromise<any> = callPath
        .reduce((acc: any, elem: string) => acc[elem], baseClient)
        [baseAction](...finalArgs);

      return basePromise instanceof BasePaginatorPromise
        ? PaginatorPromise.from(basePromise, { queryKey })
        : ClientPromise.from(basePromise, { queryKey });
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

    return useQuery({
      ...useQueryOptions,
      queryKey,
      queryFn: () => doFetch(),
    });
  }, []) as StainlessReactQueryClient<Api>;
  return client;
}

type ExtractClientPromiseProps = {
  queryKey: unknown[];
};

export type ClientPromiseProps = BaseClientPromiseProps &
  ExtractClientPromiseProps;

export class ClientPromise<R> extends BaseClientPromise<R> {
  queryKey: unknown[];

  constructor(
    fetch: () => Promise<R>,
    { queryKey, ...props }: ClientPromiseProps
  ) {
    super(fetch, props);
    this.queryKey = queryKey;
  }

  static from<R>(
    { fetch, method, uri, pathname, search, query }: BaseClientPromise<R>,
    { queryKey }: ExtractClientPromiseProps
  ): ClientPromise<R> {
    return new ClientPromise(fetch, {
      method,
      uri,
      pathname,
      search,
      query,
      queryKey,
    });
  }
}

export class PaginatorPromise<
  D extends z.PageData<any>
> extends BasePaginatorPromise<D> {
  queryKey: unknown[];

  constructor(
    fetch: () => Promise<Page<D>>,
    { queryKey, ...props }: ClientPromiseProps
  ) {
    super(fetch, props);
    this.queryKey = queryKey;
  }

  static from<D extends z.PageData<any>>(
    { fetch, method, uri, pathname, search, query }: BasePaginatorPromise<D>,
    { queryKey }: ExtractClientPromiseProps
  ): PaginatorPromise<D> {
    return new PaginatorPromise(fetch, {
      method,
      uri,
      pathname,
      search,
      query,
      queryKey,
    });
  }
}
