import { isEmpty } from "lodash";
// This is required so that we can determine if a given object matches the RequestOptions
// type at runtime. While this requires duplication, it is enforced by the TypeScript
// compiler such that any missing / extraneous keys will cause an error.
const useInfiniteQueryOptionsKeys = {
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
export const isUseInfiniteQueryOptions = (obj) => {
    return (typeof obj === "object" &&
        obj !== null &&
        !isEmpty(obj) &&
        Object.keys(obj).every((k) => Object.hasOwn(useInfiniteQueryOptionsKeys, k)));
};
//# sourceMappingURL=useInfiniteQuery.js.map