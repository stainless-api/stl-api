import * as ReactQuery from "@tanstack/react-query";

export type Config = typeof ReactQuery;

type StlApiProvidedOpts = "queryFn" | "queryKey" | "mutationFn";
type UseQueryOptions = Omit<ReactQuery.UseQueryOptions, StlApiProvidedOpts> & {
  query?: Record<string, unknown>;
};
type UseMutationOptions = Omit<
  ReactQuery.UseMutationOptions,
  StlApiProvidedOpts
>;

export type MakeExtension<Input, Query, Output> = Input extends undefined
  ? {
      useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<Output>;
      useSuspenseQuery(
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
        opts?: UseQueryOptions
      ): ReactQuery.UseQueryResult<Output>;
      useSuspenseQuery(
        body: Input,
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
    useQuery(bodyOrOptions, options) {
      const { query, ...reactQueryOptions } = options ?? bodyOrOptions ?? {};
      return config.useQuery({
        ...reactQueryOptions,
        queryFn,
        queryKey,
      });
    },
    useSuspenseQuery(bodyOrOptions, options) {
      const { query, ...reactQueryOptions } = options ?? bodyOrOptions ?? {};
      return config.useSuspenseQuery({
        ...reactQueryOptions,
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
