import { isEmpty } from "lodash";
import {
  AnyEndpoint,
  AnyResourceConfig,
  EndpointHasRequiredQuery,
  EndpointQueryInput,
  EndpointResponseOutput,
  z,
} from "stainless";
import {
  type UseInfiniteQueryOptions as BaseUseInfiniteQueryOptions,
  type UseInfiniteQueryResult as BaseUseInfiniteQueryResult,
} from "@tanstack/react-query";
import { EndpointPathParam, KeysEnum, PaginatedActions } from "./index.js";
import { UpperFirst } from "./util.js";

type UseInfiniteAction<Action extends string> =
  `useInfinite${UpperFirst<Action>}`;

export type ClientUseInfiniteQueryHooks<Resource extends AnyResourceConfig> = {
  [Action in PaginatedActions<Resource> as UseInfiniteAction<Action>]: ClientUseInfiniteQuery<
    Resource["actions"][Action]
  >;
};

export type ClientUseInfiniteQuery<
  E extends AnyEndpoint,
  TQueryFnData = EndpointResponseOutput<E>,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData
> = E["path"] extends z.ZodTypeAny
  ? E["query"] extends z.ZodTypeAny
    ? EndpointHasRequiredQuery<E> extends true
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
          query?: EndpointQueryInput<E>,
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
  ? EndpointHasRequiredQuery<E> extends true
    ? (
        query: EndpointQueryInput<E>,
        options?: UseInfiniteQueryOptions<
          TQueryFnData,
          TError,
          TData,
          TQueryData
        >
      ) => UseInfiniteQueryResult<TData, TError>
    : (
        query?: EndpointQueryInput<E>,
        options?: UseInfiniteQueryOptions<
          TQueryFnData,
          TError,
          TData,
          TQueryData
        >
      ) => UseInfiniteQueryResult<TData, TError>
  : (
      options?: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryData>
    ) => UseInfiniteQueryResult<TData, TError>;

export type UseInfiniteQueryOptions<
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
const useInfiniteQueryOptionsKeys: KeysEnum<
  { query: any } & UseInfiniteQueryOptions
> = {
  query: true,
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
