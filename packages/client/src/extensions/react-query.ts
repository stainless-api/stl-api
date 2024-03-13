import * as ReactQuery from "@tanstack/react-query";

export type ReactQueryInstance = typeof ReactQuery;

type StlApiProvidedOpts = "queryFn" | "queryKey" | "mutationFn";
type UseQueryOptions = Omit<ReactQuery.UseQueryOptions, StlApiProvidedOpts>;
type UseMutationOptions = Omit<
  ReactQuery.UseMutationOptions,
  StlApiProvidedOpts
>;

export type MakeReactQueryExtension<Input, Output> = Input extends undefined
  ? {
      useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<Output>;
      useSuspenseQuery(
        opts?: UseQueryOptions
      ): ReactQuery.UseSuspenseQueryResult<Output>;
      useMutation(
        opts?: UseMutationOptions
      ): ReactQuery.UseMutationResult<Input, unknown, Output>;
      getQueryKey(): string;
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
      ): ReactQuery.UseMutationResult<Input, unknown, Output>;
      getQueryKey(): string;
    };

function makeReactQueryExtension() {}
