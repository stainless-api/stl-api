import * as React from "react";
import {
  z,
  type AnyAPIDescription,
  type AnyEndpoint,
  type AnyResourceConfig,
  type ResourceConfig,
  type HttpMethod,
  type EndpointPathInput,
  createRecursiveProxy,
  type GetEndpointMethod,
  createClient,
  ClientPromise as BaseClientPromise,
  PaginatorPromise as BasePaginatorPromise,
} from "stainless";
import { lowerFirst, isPlainObject } from "lodash";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  ContextOptions,
  useQueryClient,
  MutateOptions,
} from "@tanstack/react-query";
import { type UpperFirst } from "./util";
import { ClientUseQuery, UseQueryOptions, isUseQueryOptions } from "./useQuery";
import {
  ClientUseMutation,
  UseMutationOptions,
  isMutateOptions,
} from "./useMutation";
import {
  ClientUseInfiniteQueryHooks,
  UseInfiniteQueryOptions,
  UseItem,
  UseItemResult,
  isUseInfiniteQueryOptions,
} from "./useInfiniteQuery";
import { ClientPromise, ClientPromiseProps } from "./ClientPromise";
import { PaginatorPromise } from "./PaginatorPromise";
import { ClientMethods } from "./ClientMethod";
export {
  ClientPromise,
  ClientPromiseProps,
  PaginatorPromise,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseItem,
  UseItemResult,
};

export type ValueOf<T extends object> = T[keyof T];

export type EndpointPathParam<E extends AnyEndpoint> =
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

export type UseStainlessReactQueryClientOptions = {
  reactQueryContext?: ContextOptions["context"];
};

export type UseStainlessReactQueryClient<Api extends AnyAPIDescription> = (
  options?: UseStainlessReactQueryClientOptions
) => StainlessReactQueryClient<Api>;

export type ClientResource<Resource extends AnyResourceConfig> =
  ClientMethods<Resource> &
    ClientUseQueryAndMutationHooks<Resource> &
    ClientUseInfiniteQueryHooks<Resource> & {
      [S in keyof Resource["namespacedResources"]]: ClientResource<
        Resource["namespacedResources"][S]
      >;
    };

type ClientUseQueryAndMutationHooks<Resource extends AnyResourceConfig> = {
  [Action in keyof Resource["actions"] &
    string as UseAction<Action>]: GetEndpointMethod<
    Resource["actions"][Action]
  > extends "get"
    ? ClientUseQuery<Resource["actions"][Action]>
    : ClientUseMutation<Resource["actions"][Action]>;
};

type UseAction<Action extends string> = `use${UpperFirst<Action>}`;

export type ActionsForMethod<
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

export type Headers = Record<string, string | null | undefined>;
export type KeysEnum<T> = { [P in keyof Required<T>]: true };

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

const queryKeyMethods = new Set(["invalidateQueries", "getQueryKey"]);

export function createUseReactQueryClient<Api extends AnyAPIDescription>(
  baseUrl: string,
  options?: { fetch?: typeof fetch }
): UseStainlessReactQueryClient<Api> {
  return ({
    reactQueryContext,
  }: UseStainlessReactQueryClientOptions = {}): StainlessReactQueryClient<Api> => {
    const queryClient = useQueryClient({ context: reactQueryContext });

    const baseClient = createClient<Api>(baseUrl, options);

    const client = createRecursiveProxy((opts) => {
      const args = [...opts.args];
      const callPath = [...opts.path]; // e.g. ["issuing", "cards", "create"]
      const action = callPath.pop()!; // TODO validate

      const isHook = /^use[_A-Z]/.test(action);
      const isQueryKeyMethod = queryKeyMethods.has(action);

      if (!isHook && !isQueryKeyMethod) {
        const baseMethod = opts.path.reduce(
          (acc: any, elem: string) => acc[elem],
          baseClient
        );
        return baseMethod(...args);
      }

      const isInfinite = /^useInfinite([_A-Z]|$)/.test(action);

      const baseAction = isQueryKeyMethod
        ? callPath.at(-1) || "get"
        : lowerFirst(action.replace(/^use(Infinite)?/, ""));
      const method = isQueryKeyMethod ? "get" : actionMethod(action);

      if (
        method === "post" ||
        method === "patch" ||
        method === "put" ||
        method === "delete"
      ) {
        const { mutate, mutateAsync, ...rest } = useMutation({
          ...(typeof args[0] === "object" ? args[0] : null),
          mutationFn: ({ args }: { args: any[] }) =>
            callPath
              .reduce((acc: any, elem: string) => acc[elem], baseClient)
              [baseAction](...args),
        });

        const mutateArgs = React.useCallback(
          (
            args: any[]
          ): [{ args: any[] }, MutateOptions<any, any, { args: any[] }>] => {
            const last = args.at(-1);
            if (last && isMutateOptions(last)) {
              args = [...args];
              const { query, ...mutateOptions } = args.pop();
              if (query) args.push({ query });
              return [{ args }, mutateOptions];
            }
            return [{ args }, {}];
          },
          []
        );

        return {
          ...rest,
          mutate: React.useCallback(
            (...args: any[]) => {
              return mutate(...mutateArgs(args));
            },
            [mutate]
          ),
          mutateAsync: React.useCallback(
            (...args: any[]) => mutateAsync(...mutateArgs(args)),
            [mutateAsync]
          ),
        };
      }

      const reactQueryOptions:
        | ({ query?: any } & UseQueryOptions<any>)
        | undefined = (isInfinite
        ? isUseInfiniteQueryOptions
        : isUseQueryOptions)(args.at(-1))
        ? (args.pop() as any)
        : undefined;
      const query: Record<string, any> =
        reactQueryOptions?.query ||
        (isPlainObject(args.at(-1))
          ? (args.pop() as Record<string, any>)
          : undefined);

      const firstArg = args[0];
      const path =
        typeof firstArg === "string" || typeof firstArg === "number"
          ? firstArg
          : undefined;

      const queryKey = [
        ...callPath,
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
        ...reactQueryOptions,
        queryKey,
        queryFn: () => doFetch(),
      });
    }, []) as StainlessReactQueryClient<Api>;
    return client;
  };
}
