import * as ReactQuery from "@tanstack/react-query";
export type Config = typeof ReactQuery;
type StlApiProvidedOpts = "queryFn" | "queryKey" | "mutationFn";
type UseQueryOptions = Omit<ReactQuery.UseQueryOptions, StlApiProvidedOpts> & {
    query?: Record<string, unknown>;
};
type UseMutationOptions = Omit<ReactQuery.UseMutationOptions, StlApiProvidedOpts>;
export type MakeExtension<Input, Output> = {
    useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<Output>;
    useSuspenseQuery(opts?: ReactQuery.UseSuspenseQueryOptions): ReactQuery.UseSuspenseQueryResult<Output>;
    useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<Output, unknown, Input>;
    getQueryKey(): string[];
};
export declare function configureMethods(config: Config, queryFn: () => Promise<any>, queryKey: string[]): MakeExtension<any, any>;
export {};
//# sourceMappingURL=react-query.d.ts.map