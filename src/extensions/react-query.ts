import * as ReactQuery from "@tanstack/react-query";

export type Config = typeof ReactQuery;

type StlApiProvidedOpts = "queryFn" | "queryKey" | "mutationFn";
type UseQueryOptions = Omit<ReactQuery.UseQueryOptions, StlApiProvidedOpts>;
type UseMutationOptions = Omit<
  ReactQuery.UseMutationOptions,
  StlApiProvidedOpts
>;

export type MakeExtension<Input, Query, Output> = Input extends undefined
  ? {
      useQuery(
        query?: Query,
        opts?: UseQueryOptions
      ): ReactQuery.UseQueryResult<Output>;
      useSuspenseQuery(
        query?: Query,
        opts?: UseQueryOptions
      ): ReactQuery.UseSuspenseQueryResult<Output>;
      useMutation(
        opts?: UseMutationOptions
      ): ReactQuery.UseMutationResult<Output, unknown, Input>;
      getQueryKey(): string[];
    }
  : {
      useQuery(
        body: Input,
        query?: Query,
        opts?: UseQueryOptions
      ): ReactQuery.UseQueryResult<Output>;
      useSuspenseQuery(
        body: Input,
        query?: Query,
        opts?: UseQueryOptions
      ): ReactQuery.UseSuspenseQueryResult<Output>;
      useMutation(
        opts?: UseMutationOptions
      ): ReactQuery.UseMutationResult<Output, unknown, Input>;
      getQueryKey(): string[];
    };

export function configureMethods(
  config: Config,
  queryFn: () => Promise<any>,
  queryKey: string[]
): MakeExtension<any, any, any> {
  return {
    useQuery(bodyOrQueryOrOptions, queryOrOptions, options) {
      return config.useQuery({
        ...(options ?? queryOrOptions ?? bodyOrQueryOrOptions),
        queryFn,
        queryKey,
      });
    },
    useSuspenseQuery(bodyOrQueryOrOptions, queryOrOptions, options) {
      return config.useSuspenseQuery({
        ...(options ?? queryOrOptions ?? bodyOrQueryOrOptions),
        queryFn,
        queryKey,
      });
    },
    useMutation(options) {
      return config.useMutation({
        ...options,
        mutationFn: queryFn,
      });
    },
    getQueryKey() {
      return queryKey;
    },
  };
}
