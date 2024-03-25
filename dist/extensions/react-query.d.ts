import * as ReactQuery from "@tanstack/react-query";
export type Config = typeof ReactQuery;
type StlApiProvidedOpts = "queryFn" | "queryKey" | "mutationFn";
type UseQueryOptions = Omit<ReactQuery.UseQueryOptions, StlApiProvidedOpts>;
type UseMutationOptions = Omit<ReactQuery.UseMutationOptions, StlApiProvidedOpts>;
export type MakeExtension<Input, Query, Output> = Input extends undefined ? {
    useQuery(query?: Query, opts?: UseQueryOptions): ReactQuery.UseQueryResult<Output>;
    useSuspenseQuery(query?: Query, opts?: UseQueryOptions): ReactQuery.UseSuspenseQueryResult<Output>;
    useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<Output, unknown, Input>;
    getQueryKey(): string[];
} : {
    useQuery(body: Input, query?: Query, opts?: UseQueryOptions): ReactQuery.UseQueryResult<Output>;
    useSuspenseQuery(body: Input, query?: Query, opts?: UseQueryOptions): ReactQuery.UseSuspenseQueryResult<Output>;
    useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<Output, unknown, Input>;
    getQueryKey(): string[];
};
export declare function configureMethods(config: Config, queryFn: () => Promise<any>, queryKey: string[]): MakeExtension<any, any, any>;
export {};
//# sourceMappingURL=react-query.d.ts.map