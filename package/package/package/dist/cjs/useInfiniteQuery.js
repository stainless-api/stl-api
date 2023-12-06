"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUseInfiniteQueryOptions = void 0;
const lodash_1 = require("lodash");
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
const isUseInfiniteQueryOptions = (obj) => {
    return (typeof obj === "object" &&
        obj !== null &&
        !(0, lodash_1.isEmpty)(obj) &&
        Object.keys(obj).every((k) => Object.hasOwn(useInfiniteQueryOptionsKeys, k)));
};
exports.isUseInfiniteQueryOptions = isUseInfiniteQueryOptions;
//# sourceMappingURL=useInfiniteQuery.js.map