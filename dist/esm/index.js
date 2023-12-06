var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import { createRecursiveProxy, createClient, PaginatorPromise as BasePaginatorPromise, } from "stainless";
import { lowerFirst, isPlainObject } from "lodash";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient, } from "@tanstack/react-query";
import { isUseQueryOptions, } from "./useQuery.js";
import { isMutateOptions, } from "./useMutation.js";
import { isUseInfiniteQueryOptions, } from "./useInfiniteQuery.js";
import { ClientPromise } from "./ClientPromise.js";
import { PaginatorPromise } from "./PaginatorPromise.js";
export { ClientPromise, PaginatorPromise, };
function actionMethod(action) {
    if (/^(get|retrieve|list|use(Get|Retrieve|(Infinite)?List))([_A-Z]|$)/.test(action))
        return "GET";
    if (/^delete([_A-Z]|$)/.test(action))
        return "DELETE";
    // TODO: is it possible to deal with patch/put?
    return "POST";
}
const queryKeyMethods = new Set([
    "getQueryKey",
    // TODO: invalidateQueries etc
]);
export function createUseReactQueryClient(baseUrl, options) {
    return ({ reactQueryContext, } = {}) => {
        const queryClient = useQueryClient({ context: reactQueryContext });
        const baseClient = createClient(baseUrl, options);
        const client = createRecursiveProxy((opts) => {
            const args = [...opts.args];
            const callPath = [...opts.path]; // e.g. ["issuing", "cards", "create"]
            const action = callPath.pop(); // TODO validate
            const isHook = /^use[_A-Z]/.test(action);
            const isQueryKeyMethod = queryKeyMethods.has(action);
            if (!isHook && !isQueryKeyMethod) {
                const baseMethod = opts.path.reduce((acc, elem) => acc[elem], baseClient);
                return baseMethod(...args);
            }
            const isInfinite = /^useInfinite([_A-Z]|$)/.test(action);
            const baseAction = isQueryKeyMethod
                ? callPath.at(-1) || "GET"
                : lowerFirst(action.replace(/^use(Infinite)?/, ""));
            const method = isQueryKeyMethod ? "GET" : actionMethod(action);
            if (method === "POST" ||
                method === "PATCH" ||
                method === "PUT" ||
                method === "DELETE") {
                const _a = useMutation(Object.assign(Object.assign({}, (typeof args[0] === "object" ? args[0] : null)), { mutationFn: ({ args }) => callPath
                        .reduce((acc, elem) => acc[elem], baseClient)[baseAction](...args) })), { mutate, mutateAsync } = _a, rest = __rest(_a, ["mutate", "mutateAsync"]);
                const mutateArgs = React.useCallback((args) => {
                    const last = args.at(-1);
                    if (last && isMutateOptions(last)) {
                        args = [...args];
                        const _a = args.pop(), { query } = _a, mutateOptions = __rest(_a, ["query"]);
                        if (query)
                            args.push({ query });
                        return [{ args }, mutateOptions];
                    }
                    return [{ args }, {}];
                }, []);
                return Object.assign(Object.assign({}, rest), { mutate: React.useCallback((...args) => {
                        return mutate(...mutateArgs(args));
                    }, [mutate]), mutateAsync: React.useCallback((...args) => mutateAsync(...mutateArgs(args)), [mutateAsync]) });
            }
            const reactQueryOptions = (isInfinite
                ? isUseInfiniteQueryOptions
                : isUseQueryOptions)(args.at(-1))
                ? args.pop()
                : undefined;
            const query = (reactQueryOptions === null || reactQueryOptions === void 0 ? void 0 : reactQueryOptions.query) ||
                (isPlainObject(args.at(-1))
                    ? args.pop()
                    : undefined);
            const firstArg = args[0];
            const path = typeof firstArg === "string" || typeof firstArg === "number"
                ? firstArg
                : undefined;
            const queryKeyCallPath = [...callPath];
            if (isQueryKeyMethod)
                queryKeyCallPath.pop();
            const queryKey = [
                ...queryKeyCallPath,
                ...(path ? [path] : []),
                ...(query ? [query] : []),
            ];
            if (isQueryKeyMethod) {
                switch (action) {
                    case "getQueryKey":
                        return queryKey;
                    case "invalidateQueries":
                        return queryClient.invalidateQueries({ queryKey });
                }
                return;
            }
            const doFetch = (moreQuery) => {
                const finalArgs = [...args];
                if (query || moreQuery) {
                    const lastArg = finalArgs.at(-1);
                    if (method === "GET" &&
                        typeof lastArg === "object" &&
                        lastArg != null) {
                        finalArgs[finalArgs.length - 1] = Object.assign(Object.assign(Object.assign({}, lastArg), query), moreQuery);
                    }
                    else {
                        finalArgs.push({ query: Object.assign(Object.assign({}, query), moreQuery) });
                    }
                }
                const basePromise = callPath
                    .reduce((acc, elem) => acc[elem], baseClient)[baseAction](...finalArgs);
                return basePromise instanceof BasePaginatorPromise
                    ? PaginatorPromise.from(basePromise, { queryKey })
                    : ClientPromise.from(basePromise, { queryKey });
            };
            if (isInfinite) {
                const result = useInfiniteQuery(Object.assign(Object.assign({}, options), { queryKey, queryFn: ({ pageParam }) => doFetch(Object.assign(Object.assign({}, (pageParam
                        ? JSON.parse(pageParam)
                        : {})), query)), getNextPageParam: (lastPage) => lastPage.endCursor
                        ? JSON.stringify({ pageAfter: lastPage.endCursor })
                        : undefined, getPreviousPageParam: (firstPage) => firstPage.startCursor
                        ? JSON.stringify({ pageBefore: firstPage.startCursor })
                        : undefined }));
                const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = result;
                const pages = data === null || data === void 0 ? void 0 : data.pages;
                const items = React.useMemo(() => (pages === null || pages === void 0 ? void 0 : pages.flatMap((p) => p.items)) || [], [pages]);
                const itemCount = items.length;
                const itemAndPlaceholderCount = items.length + (hasNextPage ? 1 : 0);
                /**
                 * This is a custom hook for infinite scroll views to use, it gets the
                 * item at the given index.  If the index is after the last item and
                 * there is more, triggers fetchNextPage and returns a loading placeholder.
                 * TODO: evict items at the beginning if the user scrolls far enough
                 */
                const useItem = React.useCallback((index) => {
                    const needNextPage = hasNextPage && index >= items.length;
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    React.useEffect(() => {
                        if (needNextPage && !isFetchingNextPage)
                            fetchNextPage();
                        // eslint-disable-next-line react-hooks/exhaustive-deps
                    }, [needNextPage, isFetchingNextPage]);
                    if (items[index])
                        return { status: "loaded", data: items[index] };
                    if (hasNextPage && index === items.length) {
                        return { status: "loading" };
                    }
                }, [items, hasNextPage, isFetchingNextPage, fetchNextPage]);
                return React.useMemo(() => (Object.assign(Object.assign({}, result), { items,
                    itemCount,
                    itemAndPlaceholderCount,
                    useItem })), [result, items, itemCount, itemAndPlaceholderCount, useItem]);
            }
            return useQuery(Object.assign(Object.assign({}, reactQueryOptions), { queryKey, queryFn: () => doFetch() }));
        }, []);
        return client;
    };
}
//# sourceMappingURL=index.js.map