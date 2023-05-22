import * as React from "react";
import {
  ClientPromise,
  PageData,
  PageItemType,
  PaginationParams,
} from "@stl-api/stl";
import {
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useInfiniteQuery as _useInfiniteQuery,
} from "@tanstack/react-query";

type ListResource<Q extends PaginationParams, I> = {
  list: (query: Q) => ClientPromise<PageData<I>>;
};

type GetQuery<R> = R extends {
  list: (query: infer Q) => any;
}
  ? Q
  : never;

type GetPage<R> = R extends {
  list: (query: any) => ClientPromise<infer P>;
}
  ? P
  : never;

export type UseItemResult<Item> =
  | { status: "loading" }
  | { status: "loaded"; data: Item }
  | { status: "error"; error: Error }
  | undefined;

export type UseItem<Item> = (index: number) => UseItemResult<Item>;

export function useInfiniteQuery<
  Resource extends ListResource<any, any>,
  TError
>(
  resource: Resource,
  query: GetQuery<Resource>,
  options?: Omit<
    UseInfiniteQueryOptions<
      GetPage<Resource>,
      TError,
      GetPage<Resource>,
      GetPage<Resource>,
      any
    >,
    "queryKey" | "queryFn" | "getNextPageParam" | "getPreviousPageParam"
  >
): UseInfiniteQueryResult<GetPage<Resource>, TError> & {
  itemCount: number;
  /**
   * This is the itemCount + 1 if hasNextPage, else just
   * the itemCount.
   */
  itemAndPlaceholderCount: number;
  items: PageItemType<GetPage<Resource>>[];
  useItem: UseItem<PageItemType<GetPage<Resource>>>;
} {
  const result = _useInfiniteQuery<
    GetPage<Resource>,
    TError,
    GetPage<Resource>,
    any
  >({
    ...options,
    queryKey: [resource.list(query).cacheKey],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      resource.list({
        ...(pageParam
          ? (JSON.parse(pageParam) as {
              pageAfter?: string;
              pageBefore?: string;
            })
          : {}),
        ...query,
      }) as ClientPromise<GetPage<Resource>>,
    getNextPageParam: (lastPage: GetPage<Resource>) =>
      lastPage.endCursor
        ? JSON.stringify({ pageAfter: lastPage.endCursor })
        : undefined,
    getPreviousPageParam: (firstPage: GetPage<Resource>) =>
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
    (index: number): UseItemResult<GetPage<Resource>> => {
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
