import { ClientConfig } from "../index";
import * as ReactQuery from "@tanstack/react-query";
type StlApiProvidedOpts = "queryFn" | "queryKey" | "mutationFn";
type UseQueryOptions = Omit<ReactQuery.UseQueryOptions, StlApiProvidedOpts>;
type UseMutationOptions = Omit<ReactQuery.UseMutationOptions, StlApiProvidedOpts>;
export interface Client {
    cats: {
        useList(): {
            queryFn(): Promise<{
                name: string;
                color: string;
            }[]>;
            queryKey: string[];
        };
        list: {
            (): Promise<{
                name: string;
                color: string;
            }[]>;
            useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
                name: string;
                color: string;
            }[]>;
            useSuspenseQuery(opts?: UseQueryOptions): ReactQuery.UseSuspenseQueryResult<{
                name: string;
                color: string;
            }[]>;
            useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<undefined, unknown, {
                name: string;
                color: string;
            }[]>;
            getQueryKey(): string[];
        };
        useCreate(body: {
            name: string;
            color: string;
        }): {
            queryFn(): Promise<{
                name: string;
                color: string;
            }>;
            queryKey: string[];
        };
        create: {
            (body: {
                name: string;
                color: string;
            }): Promise<{
                name: string;
                color: string;
            }>;
            useQuery(body: {
                name: string;
                color: string;
            }, opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
                name: string;
                color: string;
            }>;
            useSuspenseQuery(body: {
                name: string;
                color: string;
            }, opts?: UseQueryOptions): ReactQuery.UseSuspenseQueryResult<{
                name: string;
                color: string;
            }>;
            useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<{
                name: string;
                color: string;
            }, unknown, {
                name: string;
                color: string;
            }>;
            getQueryKey(): string[];
        };
        (catName: string | number): {
            useUpdate(body: {
                name?: string | undefined;
                color?: string | undefined;
            }): {
                queryFn(): Promise<{
                    name: string;
                    color: string;
                }>;
                queryKey: string[];
            };
            update: {
                (body: {
                    name?: string | undefined;
                    color?: string | undefined;
                }): Promise<{
                    name: string;
                    color: string;
                }>;
                useQuery(body: {
                    name?: string | undefined;
                    color?: string | undefined;
                }, opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
                    name: string;
                    color: string;
                }>;
                useSuspenseQuery(body: {
                    name?: string | undefined;
                    color?: string | undefined;
                }, opts?: UseQueryOptions): ReactQuery.UseSuspenseQueryResult<{
                    name: string;
                    color: string;
                }>;
                useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<{
                    name?: string | undefined;
                    color?: string | undefined;
                }, unknown, {
                    name: string;
                    color: string;
                }>;
                getQueryKey(): string[];
            };
            useRetrieve(): {
                queryFn(): Promise<{
                    name: string;
                    color: string;
                }>;
                queryKey: string[];
            };
            retrieve: {
                (): Promise<{
                    name: string;
                    color: string;
                }>;
                useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
                    name: string;
                    color: string;
                }>;
                useSuspenseQuery(opts?: UseQueryOptions): ReactQuery.UseSuspenseQueryResult<{
                    name: string;
                    color: string;
                }>;
                useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<undefined, unknown, {
                    name: string;
                    color: string;
                }>;
                getQueryKey(): string[];
            };
            litter: {
                useRetrieveLitter(): {
                    queryFn(): Promise<{
                        name: string;
                        color: string;
                    }[]>;
                    queryKey: string[];
                };
                retrieveLitter: {
                    (): Promise<{
                        name: string;
                        color: string;
                    }[]>;
                    useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
                        name: string;
                        color: string;
                    }[]>;
                    useSuspenseQuery(opts?: UseQueryOptions): ReactQuery.UseSuspenseQueryResult<{
                        name: string;
                        color: string;
                    }[]>;
                    useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<undefined, unknown, {
                        name: string;
                        color: string;
                    }[]>;
                    getQueryKey(): string[];
                };
            };
        };
    };
    dogs: {
        useList(): {
            queryFn(): Promise<{
                name: string;
                color: string;
            }[]>;
            queryKey: string[];
        };
        list: {
            (): Promise<{
                name: string;
                color: string;
            }[]>;
            useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
                name: string;
                color: string;
            }[]>;
            useSuspenseQuery(opts?: UseQueryOptions): ReactQuery.UseSuspenseQueryResult<{
                name: string;
                color: string;
            }[]>;
            useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<undefined, unknown, {
                name: string;
                color: string;
            }[]>;
            getQueryKey(): string[];
        };
        useCreate(body: {
            name: string;
            color: string;
        }): {
            queryFn(): Promise<{
                name: string;
                color: string;
            }>;
            queryKey: string[];
        };
        create: {
            (body: {
                name: string;
                color: string;
            }): Promise<{
                name: string;
                color: string;
            }>;
            useQuery(body: {
                name: string;
                color: string;
            }, opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
                name: string;
                color: string;
            }>;
            useSuspenseQuery(body: {
                name: string;
                color: string;
            }, opts?: UseQueryOptions): ReactQuery.UseSuspenseQueryResult<{
                name: string;
                color: string;
            }>;
            useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<{
                name: string;
                color: string;
            }, unknown, {
                name: string;
                color: string;
            }>;
            getQueryKey(): string[];
        };
        (dogName: string | number): {
            useRetrieve(): {
                queryFn(): Promise<{
                    name: string;
                    color: string;
                }>;
                queryKey: string[];
            };
            retrieve: {
                (): Promise<{
                    name: string;
                    color: string;
                }>;
                useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
                    name: string;
                    color: string;
                }>;
                useSuspenseQuery(opts?: UseQueryOptions): ReactQuery.UseSuspenseQueryResult<{
                    name: string;
                    color: string;
                }>;
                useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<undefined, unknown, {
                    name: string;
                    color: string;
                }>;
                getQueryKey(): string[];
            };
            useUpdate(body: {
                name?: string | undefined;
                color?: string | undefined;
            }): {
                queryFn(): Promise<{
                    name: string;
                    color: string;
                }>;
                queryKey: string[];
            };
            update: {
                (body: {
                    name?: string | undefined;
                    color?: string | undefined;
                }): Promise<{
                    name: string;
                    color: string;
                }>;
                useQuery(body: {
                    name?: string | undefined;
                    color?: string | undefined;
                }, opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
                    name: string;
                    color: string;
                }>;
                useSuspenseQuery(body: {
                    name?: string | undefined;
                    color?: string | undefined;
                }, opts?: UseQueryOptions): ReactQuery.UseSuspenseQueryResult<{
                    name: string;
                    color: string;
                }>;
                useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<{
                    name?: string | undefined;
                    color?: string | undefined;
                }, unknown, {
                    name: string;
                    color: string;
                }>;
                getQueryKey(): string[];
            };
            litter: {
                useRetrieveLitter(): {
                    queryFn(): Promise<{
                        name: string;
                        color: string;
                    }[]>;
                    queryKey: string[];
                };
                retrieveLitter: {
                    (): Promise<{
                        name: string;
                        color: string;
                    }[]>;
                    useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
                        name: string;
                        color: string;
                    }[]>;
                    useSuspenseQuery(opts?: UseQueryOptions): ReactQuery.UseSuspenseQueryResult<{
                        name: string;
                        color: string;
                    }[]>;
                    useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<undefined, unknown, {
                        name: string;
                        color: string;
                    }[]>;
                    getQueryKey(): string[];
                };
            };
            dogTreats: {
                useGet(): {
                    queryFn(): Promise<{
                        yummy: boolean;
                    }>;
                    queryKey: string[];
                };
                get: {
                    (): Promise<{
                        yummy: boolean;
                    }>;
                    useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
                        yummy: boolean;
                    }>;
                    useSuspenseQuery(opts?: UseQueryOptions): ReactQuery.UseSuspenseQueryResult<{
                        yummy: boolean;
                    }>;
                    useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<undefined, unknown, {
                        yummy: boolean;
                    }>;
                    getQueryKey(): string[];
                };
            };
        };
    };
}
export declare function makeClient(config: ClientConfig): Client;
export {};
//# sourceMappingURL=generated-api-types.d.ts.map