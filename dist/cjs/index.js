"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUseReactQueryClient = exports.PaginatorPromise = exports.ClientPromise = void 0;
const React = __importStar(require("react"));
const stainless_1 = require("stainless");
const lodash_1 = require("lodash");
const react_query_1 = require("@tanstack/react-query");
const useQuery_1 = require("./useQuery");
const useMutation_1 = require("./useMutation");
const useInfiniteQuery_1 = require("./useInfiniteQuery");
const ClientPromise_1 = require("./ClientPromise");
Object.defineProperty(exports, "ClientPromise", { enumerable: true, get: function () { return ClientPromise_1.ClientPromise; } });
const PaginatorPromise_1 = require("./PaginatorPromise");
Object.defineProperty(exports, "PaginatorPromise", { enumerable: true, get: function () { return PaginatorPromise_1.PaginatorPromise; } });
function actionMethod(action) {
    if (/^(get|retrieve|list|use(Get|Retrieve|(Infinite)?List))([_A-Z]|$)/.test(action))
        return "get";
    if (/^delete([_A-Z]|$)/.test(action))
        return "delete";
    // TODO: is it possible to deal with patch/put?
    return "post";
}
const queryKeyMethods = new Set([
    "getQueryKey",
    // TODO: invalidateQueries etc
]);
function createUseReactQueryClient(baseUrl, options) {
    return ({ reactQueryContext, } = {}) => {
        const queryClient = (0, react_query_1.useQueryClient)({ context: reactQueryContext });
        const baseClient = (0, stainless_1.createClient)(baseUrl, options);
        const client = (0, stainless_1.createRecursiveProxy)((opts) => {
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
                ? callPath.at(-1) || "get"
                : (0, lodash_1.lowerFirst)(action.replace(/^use(Infinite)?/, ""));
            const method = isQueryKeyMethod ? "get" : actionMethod(action);
            if (method === "post" ||
                method === "patch" ||
                method === "put" ||
                method === "delete") {
                const _a = (0, react_query_1.useMutation)(Object.assign(Object.assign({}, (typeof args[0] === "object" ? args[0] : null)), { mutationFn: ({ args }) => callPath
                        .reduce((acc, elem) => acc[elem], baseClient)[baseAction](...args) })), { mutate, mutateAsync } = _a, rest = __rest(_a, ["mutate", "mutateAsync"]);
                const mutateArgs = React.useCallback((args) => {
                    const last = args.at(-1);
                    if (last && (0, useMutation_1.isMutateOptions)(last)) {
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
                ? useInfiniteQuery_1.isUseInfiniteQueryOptions
                : useQuery_1.isUseQueryOptions)(args.at(-1))
                ? args.pop()
                : undefined;
            const query = (reactQueryOptions === null || reactQueryOptions === void 0 ? void 0 : reactQueryOptions.query) ||
                ((0, lodash_1.isPlainObject)(args.at(-1))
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
                    if (method === "get" &&
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
                return basePromise instanceof stainless_1.PaginatorPromise
                    ? PaginatorPromise_1.PaginatorPromise.from(basePromise, { queryKey })
                    : ClientPromise_1.ClientPromise.from(basePromise, { queryKey });
            };
            if (isInfinite) {
                const result = (0, react_query_1.useInfiniteQuery)(Object.assign(Object.assign({}, options), { queryKey, queryFn: ({ pageParam }) => doFetch(Object.assign(Object.assign({}, (pageParam
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
            return (0, react_query_1.useQuery)(Object.assign(Object.assign({}, reactQueryOptions), { queryKey, queryFn: () => doFetch() }));
        }, []);
        return client;
    };
}
exports.createUseReactQueryClient = createUseReactQueryClient;
//# sourceMappingURL=index.js.map