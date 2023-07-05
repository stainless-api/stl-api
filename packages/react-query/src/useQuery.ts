import {
  z,
  type AnyEndpoint,
  type EndpointBodyInput,
  type EndpointQueryInput,
  type EndpointResponseOutput,
} from "stainless";
import { isEmpty } from "lodash";
import {
  type UseQueryOptions as BaseUseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { EndpointPathParam } from ".";

export type ClientUseQuery<
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

export type UseQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData
> = Omit<
  BaseUseQueryOptions<TQueryFnData, TError, TData, any>,
  "queryKey" | "queryFn"
>;

export type KeysEnum<T> = { [P in keyof Required<T>]: true };

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
