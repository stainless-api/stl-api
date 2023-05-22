import { ClientPromise } from "@stl-api/stl";
import {
  UseQueryOptions,
  UseQueryResult,
  useQuery as _useQuery,
} from "@tanstack/react-query";

export function useQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData
>(
  promise: ClientPromise<TQueryFnData>,
  options: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, any>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<TData, TError> {
  return _useQuery({
    ...options,
    queryKey: [promise.cacheKey],
    queryFn: () => promise,
  });
}
