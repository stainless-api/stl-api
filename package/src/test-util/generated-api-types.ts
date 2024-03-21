/* eslint-disable prettier/prettier */
// This is an auto-generated file, any manual changes will be overwritten.
import { ClientConfig, makeClientWithExplicitTypes } from "../index";
// React-query extension related types
import * as ReactQuery from "@tanstack/react-query";

type StlApiProvidedOpts = "queryFn" | "queryKey" | "mutationFn";
type UseQueryOptions = Omit<ReactQuery.UseQueryOptions, StlApiProvidedOpts>;
type UseMutationOptions = Omit<
  ReactQuery.UseMutationOptions,
  StlApiProvidedOpts
>;

export interface Client {
  cats: {
    useList(): {
      queryFn(): Promise<
        {
          name: string,
          color: string,
        }[]
      >,
      queryKey: string[],
    },
    list: {
      (): Promise<
        {
          name: string,
          color: string,
        }[]
      >,
      useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<
        {
          name: string,
          color: string,
        }[]
      >,
      useSuspenseQuery(
        opts?: UseQueryOptions
      ): ReactQuery.UseSuspenseQueryResult<
        {
          name: string,
          color: string,
        }[]
      >,
      useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
        undefined,
        unknown,
        {
          name: string,
          color: string,
        }[]
      >,
      getQueryKey(): string[],
    },
    useCreate(body: {
      name: string,
      color: string,
    }): {
      queryFn(): Promise<{
        name: string,
        color: string,
      }>,
      queryKey: string[],
    },
    create: {
      (body: {
        name: string,
        color: string,
      }): Promise<{
        name: string,
        color: string,
      }>,
      useQuery(
        body: {
          name: string,
          color: string,
        },
        opts?: UseQueryOptions
      ): ReactQuery.UseQueryResult<{
        name: string,
        color: string,
      }>,
      useSuspenseQuery(
        body: {
          name: string,
          color: string,
        },
        opts?: UseQueryOptions
      ): ReactQuery.UseSuspenseQueryResult<{
        name: string,
        color: string,
      }>,
      useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
        {
          name: string,
          color: string,
        },
        unknown,
        {
          name: string,
          color: string,
        }
      >,
      getQueryKey(): string[],
    },
    (catName: string | number): {
      useUpdate(body: {
        name?: string | undefined,
        color?: string | undefined,
      }): {
        queryFn(): Promise<{
          name: string,
          color: string,
        }>,
        queryKey: string[],
      },
      update: {
        (body: {
          name?: string | undefined,
          color?: string | undefined,
        }): Promise<{
          name: string,
          color: string,
        }>,
        useQuery(
          body: {
            name?: string | undefined,
            color?: string | undefined,
          },
          opts?: UseQueryOptions
        ): ReactQuery.UseQueryResult<{
          name: string,
          color: string,
        }>,
        useSuspenseQuery(
          body: {
            name?: string | undefined,
            color?: string | undefined,
          },
          opts?: UseQueryOptions
        ): ReactQuery.UseSuspenseQueryResult<{
          name: string,
          color: string,
        }>,
        useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
          {
            name?: string | undefined,
            color?: string | undefined,
          },
          unknown,
          {
            name: string,
            color: string,
          }
        >,
        getQueryKey(): string[],
      },
      useRetrieve(): {
        queryFn(): Promise<{
          name: string,
          color: string,
        }>,
        queryKey: string[],
      },
      retrieve: {
        (): Promise<{
          name: string,
          color: string,
        }>,
        useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
          name: string,
          color: string,
        }>,
        useSuspenseQuery(
          opts?: UseQueryOptions
        ): ReactQuery.UseSuspenseQueryResult<{
          name: string,
          color: string,
        }>,
        useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
          undefined,
          unknown,
          {
            name: string,
            color: string,
          }
        >,
        getQueryKey(): string[],
      },
      litter: {
        useRetrieveLitter(): {
          queryFn(): Promise<
            {
              name: string,
              color: string,
            }[]
          >,
          queryKey: string[],
        },
        retrieveLitter: {
          (): Promise<
            {
              name: string,
              color: string,
            }[]
          >,
          useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<
            {
              name: string,
              color: string,
            }[]
          >,
          useSuspenseQuery(
            opts?: UseQueryOptions
          ): ReactQuery.UseSuspenseQueryResult<
            {
              name: string,
              color: string,
            }[]
          >,
          useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
            undefined,
            unknown,
            {
              name: string,
              color: string,
            }[]
          >,
          getQueryKey(): string[],
        },
      },
    },
  };
  dogs: {
    useList(): {
      queryFn(): Promise<
        {
          name: string,
          color: string,
        }[]
      >,
      queryKey: string[],
    },
    list: {
      (): Promise<
        {
          name: string,
          color: string,
        }[]
      >,
      useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<
        {
          name: string,
          color: string,
        }[]
      >,
      useSuspenseQuery(
        opts?: UseQueryOptions
      ): ReactQuery.UseSuspenseQueryResult<
        {
          name: string,
          color: string,
        }[]
      >,
      useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
        undefined,
        unknown,
        {
          name: string,
          color: string,
        }[]
      >,
      getQueryKey(): string[],
    },
    useCreate(body: {
      name: string,
      color: string,
    }): {
      queryFn(): Promise<{
        name: string,
        color: string,
      }>,
      queryKey: string[],
    },
    create: {
      (body: {
        name: string,
        color: string,
      }): Promise<{
        name: string,
        color: string,
      }>,
      useQuery(
        body: {
          name: string,
          color: string,
        },
        opts?: UseQueryOptions
      ): ReactQuery.UseQueryResult<{
        name: string,
        color: string,
      }>,
      useSuspenseQuery(
        body: {
          name: string,
          color: string,
        },
        opts?: UseQueryOptions
      ): ReactQuery.UseSuspenseQueryResult<{
        name: string,
        color: string,
      }>,
      useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
        {
          name: string,
          color: string,
        },
        unknown,
        {
          name: string,
          color: string,
        }
      >,
      getQueryKey(): string[],
    },
    (dogName: string | number): {
      useRetrieve(): {
        queryFn(): Promise<{
          name: string,
          color: string,
        }>,
        queryKey: string[],
      },
      retrieve: {
        (): Promise<{
          name: string,
          color: string,
        }>,
        useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
          name: string,
          color: string,
        }>,
        useSuspenseQuery(
          opts?: UseQueryOptions
        ): ReactQuery.UseSuspenseQueryResult<{
          name: string,
          color: string,
        }>,
        useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
          undefined,
          unknown,
          {
            name: string,
            color: string,
          }
        >,
        getQueryKey(): string[],
      },
      useUpdate(body: {
        name?: string | undefined,
        color?: string | undefined,
      }): {
        queryFn(): Promise<{
          name: string,
          color: string,
        }>,
        queryKey: string[],
      },
      update: {
        (body: {
          name?: string | undefined,
          color?: string | undefined,
        }): Promise<{
          name: string,
          color: string,
        }>,
        useQuery(
          body: {
            name?: string | undefined,
            color?: string | undefined,
          },
          opts?: UseQueryOptions
        ): ReactQuery.UseQueryResult<{
          name: string,
          color: string,
        }>,
        useSuspenseQuery(
          body: {
            name?: string | undefined,
            color?: string | undefined,
          },
          opts?: UseQueryOptions
        ): ReactQuery.UseSuspenseQueryResult<{
          name: string,
          color: string,
        }>,
        useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
          {
            name?: string | undefined,
            color?: string | undefined,
          },
          unknown,
          {
            name: string,
            color: string,
          }
        >,
        getQueryKey(): string[],
      },
      litter: {
        useRetrieveLitter(): {
          queryFn(): Promise<
            {
              name: string,
              color: string,
            }[]
          >,
          queryKey: string[],
        },
        retrieveLitter: {
          (): Promise<
            {
              name: string,
              color: string,
            }[]
          >,
          useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<
            {
              name: string,
              color: string,
            }[]
          >,
          useSuspenseQuery(
            opts?: UseQueryOptions
          ): ReactQuery.UseSuspenseQueryResult<
            {
              name: string,
              color: string,
            }[]
          >,
          useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
            undefined,
            unknown,
            {
              name: string,
              color: string,
            }[]
          >,
          getQueryKey(): string[],
        },
      },
      dogTreats: {
        useList(): {
          queryFn(): Promise<
            {
              yummy: boolean,
            }[]
          >,
          queryKey: string[],
        },
        list: {
          (): Promise<
            {
              yummy: boolean,
            }[]
          >,
          useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<
            {
              yummy: boolean,
            }[]
          >,
          useSuspenseQuery(
            opts?: UseQueryOptions
          ): ReactQuery.UseSuspenseQueryResult<
            {
              yummy: boolean,
            }[]
          >,
          useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
            undefined,
            unknown,
            {
              yummy: boolean,
            }[]
          >,
          getQueryKey(): string[],
        },
        (treatId: string | number): {
          useRetrieveTreat(): {
            queryFn(): Promise<{
              yummy: boolean,
            }>,
            queryKey: string[],
          },
          retrieveTreat: {
            (): Promise<{
              yummy: boolean,
            }>,
            useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
              yummy: boolean,
            }>,
            useSuspenseQuery(
              opts?: UseQueryOptions
            ): ReactQuery.UseSuspenseQueryResult<{
              yummy: boolean,
            }>,
            useMutation(
              opts?: UseMutationOptions
            ): ReactQuery.UseMutationResult<
              undefined,
              unknown,
              {
                yummy: boolean,
              }
            >,
            getQueryKey(): string[],
          },
          useUpdate(body: {
            yummy: boolean,
          }): {
            queryFn(): Promise<{
              yummy: boolean,
            }>,
            queryKey: string[],
          },
          update: {
            (body: {
              yummy: boolean,
            }): Promise<{
              yummy: boolean,
            }>,
            useQuery(
              body: {
                yummy: boolean,
              },
              opts?: UseQueryOptions
            ): ReactQuery.UseQueryResult<{
              yummy: boolean,
            }>,
            useSuspenseQuery(
              body: {
                yummy: boolean,
              },
              opts?: UseQueryOptions
            ): ReactQuery.UseSuspenseQueryResult<{
              yummy: boolean,
            }>,
            useMutation(
              opts?: UseMutationOptions
            ): ReactQuery.UseMutationResult<
              {
                yummy: boolean,
              },
              unknown,
              {
                yummy: boolean,
              }
            >,
            getQueryKey(): string[],
          },
        },
      },
    },
  };
}

export function makeClient(config: ClientConfig) {
  // prettier-ignore
  return makeClientWithExplicitTypes<Client>(config);
}
