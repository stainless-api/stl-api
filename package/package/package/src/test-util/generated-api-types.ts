/* eslint-disable prettier/prettier */
// This is an auto-generated file, any manual changes will be overwritten.
import { ClientConfig, makeClientWithExplicitTypes } from "../index"
// React-query extension related types
import * as ReactQuery from "@tanstack/react-query"

type StlApiProvidedOpts = "queryFn" | "queryKey" | "mutationFn"
type UseQueryOptions = Omit<ReactQuery.UseQueryOptions, StlApiProvidedOpts>
type UseMutationOptions = Omit<
  ReactQuery.UseMutationOptions,
  StlApiProvidedOpts
>

export interface Client {
  cats: {
    useList(): {
      queryFn(): Promise<
        {
          name: string
          color: string
        }[]
      >
      queryKey: string[]
    }
    list: {
      (): Promise<
        {
          name: string
          color: string
        }[]
      >
      useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<
        {
          name: string
          color: string
        }[]
      >
      useSuspenseQuery(
        opts?: UseQueryOptions,
      ): ReactQuery.UseSuspenseQueryResult<
        {
          name: string
          color: string
        }[]
      >
      useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
        {
          name: string
          color: string
        }[],
        unknown,
        void
      >
      getQueryKey(): string[]
    }
    useCreate(body: { name: string; color: string }): {
      queryFn(): Promise<{
        name: string
        color: string
      }>
      queryKey: string[]
    }
    create: {
      (body: { name: string; color: string }): Promise<{
        name: string
        color: string
      }>
      useQuery(
        body: {
          name: string
          color: string
        },
        opts?: UseQueryOptions,
      ): ReactQuery.UseQueryResult<{
        name: string
        color: string
      }>
      useSuspenseQuery(
        body: {
          name: string
          color: string
        },
        opts?: UseQueryOptions,
      ): ReactQuery.UseSuspenseQueryResult<{
        name: string
        color: string
      }>
      useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
        {
          name: string
          color: string
        },
        unknown,
        {
          name: string
          color: string
        }
      >
      getQueryKey(): string[]
    }
    (catName: string | number): {
      useUpdate(body: {
        name?: string | undefined
        color?: string | undefined
      }): {
        queryFn(): Promise<{
          name: string
          color: string
        }>
        queryKey: string[]
      }
      update: {
        (body: {
          name?: string | undefined
          color?: string | undefined
        }): Promise<{
          name: string
          color: string
        }>
        useQuery(
          body: {
            name?: string | undefined
            color?: string | undefined
          },
          opts?: UseQueryOptions,
        ): ReactQuery.UseQueryResult<{
          name: string
          color: string
        }>
        useSuspenseQuery(
          body: {
            name?: string | undefined
            color?: string | undefined
          },
          opts?: UseQueryOptions,
        ): ReactQuery.UseSuspenseQueryResult<{
          name: string
          color: string
        }>
        useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
          {
            name: string
            color: string
          },
          unknown,
          {
            name?: string | undefined
            color?: string | undefined
          }
        >
        getQueryKey(): string[]
      }
      useRetrieve(): {
        queryFn(): Promise<{
          name: string
          color: string
        }>
        queryKey: string[]
      }
      retrieve: {
        (): Promise<{
          name: string
          color: string
        }>
        useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
          name: string
          color: string
        }>
        useSuspenseQuery(
          opts?: UseQueryOptions,
        ): ReactQuery.UseSuspenseQueryResult<{
          name: string
          color: string
        }>
        useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
          {
            name: string
            color: string
          },
          unknown,
          void
        >
        getQueryKey(): string[]
      }
      litter: {
        useRetrieveLitter(): {
          queryFn(): Promise<
            {
              name: string
              color: string
            }[]
          >
          queryKey: string[]
        }
        retrieveLitter: {
          (): Promise<
            {
              name: string
              color: string
            }[]
          >
          useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<
            {
              name: string
              color: string
            }[]
          >
          useSuspenseQuery(
            opts?: UseQueryOptions,
          ): ReactQuery.UseSuspenseQueryResult<
            {
              name: string
              color: string
            }[]
          >
          useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
            {
              name: string
              color: string
            }[],
            unknown,
            void
          >
          getQueryKey(): string[]
        }
      }
    }
  }
  dogs: {
    useList(): {
      queryFn(): Promise<
        {
          name: string
          color: string
        }[]
      >
      queryKey: string[]
    }
    list: {
      (): Promise<
        {
          name: string
          color: string
        }[]
      >
      useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<
        {
          name: string
          color: string
        }[]
      >
      useSuspenseQuery(
        opts?: UseQueryOptions,
      ): ReactQuery.UseSuspenseQueryResult<
        {
          name: string
          color: string
        }[]
      >
      useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
        {
          name: string
          color: string
        }[],
        unknown,
        void
      >
      getQueryKey(): string[]
    }
    useCreate(body: { name: string; color: string }): {
      queryFn(): Promise<{
        name: string
        color: string
      }>
      queryKey: string[]
    }
    create: {
      (body: { name: string; color: string }): Promise<{
        name: string
        color: string
      }>
      useQuery(
        body: {
          name: string
          color: string
        },
        opts?: UseQueryOptions,
      ): ReactQuery.UseQueryResult<{
        name: string
        color: string
      }>
      useSuspenseQuery(
        body: {
          name: string
          color: string
        },
        opts?: UseQueryOptions,
      ): ReactQuery.UseSuspenseQueryResult<{
        name: string
        color: string
      }>
      useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
        {
          name: string
          color: string
        },
        unknown,
        {
          name: string
          color: string
        }
      >
      getQueryKey(): string[]
    }
    (dogName: string | number): {
      useRetrieve(): {
        queryFn(): Promise<{
          name: string
          color: string
        }>
        queryKey: string[]
      }
      retrieve: {
        (): Promise<{
          name: string
          color: string
        }>
        useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
          name: string
          color: string
        }>
        useSuspenseQuery(
          opts?: UseQueryOptions,
        ): ReactQuery.UseSuspenseQueryResult<{
          name: string
          color: string
        }>
        useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
          {
            name: string
            color: string
          },
          unknown,
          void
        >
        getQueryKey(): string[]
      }
      useUpdate(body: {
        name?: string | undefined
        color?: string | undefined
      }): {
        queryFn(): Promise<{
          name: string
          color: string
        }>
        queryKey: string[]
      }
      update: {
        (body: {
          name?: string | undefined
          color?: string | undefined
        }): Promise<{
          name: string
          color: string
        }>
        useQuery(
          body: {
            name?: string | undefined
            color?: string | undefined
          },
          opts?: UseQueryOptions,
        ): ReactQuery.UseQueryResult<{
          name: string
          color: string
        }>
        useSuspenseQuery(
          body: {
            name?: string | undefined
            color?: string | undefined
          },
          opts?: UseQueryOptions,
        ): ReactQuery.UseSuspenseQueryResult<{
          name: string
          color: string
        }>
        useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
          {
            name: string
            color: string
          },
          unknown,
          {
            name?: string | undefined
            color?: string | undefined
          }
        >
        getQueryKey(): string[]
      }
      litter: {
        useRetrieveLitter(): {
          queryFn(): Promise<
            {
              name: string
              color: string
            }[]
          >
          queryKey: string[]
        }
        retrieveLitter: {
          (): Promise<
            {
              name: string
              color: string
            }[]
          >
          useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<
            {
              name: string
              color: string
            }[]
          >
          useSuspenseQuery(
            opts?: UseQueryOptions,
          ): ReactQuery.UseSuspenseQueryResult<
            {
              name: string
              color: string
            }[]
          >
          useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
            {
              name: string
              color: string
            }[],
            unknown,
            void
          >
          getQueryKey(): string[]
        }
      }
      dogTreats: {
        useList(): {
          queryFn(): Promise<
            {
              yummy: boolean
            }[]
          >
          queryKey: string[]
        }
        list: {
          (): Promise<
            {
              yummy: boolean
            }[]
          >
          useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<
            {
              yummy: boolean
            }[]
          >
          useSuspenseQuery(
            opts?: UseQueryOptions,
          ): ReactQuery.UseSuspenseQueryResult<
            {
              yummy: boolean
            }[]
          >
          useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
            {
              yummy: boolean
            }[],
            unknown,
            void
          >
          getQueryKey(): string[]
        }
        (treatId: string | number): {
          useRetrieveTreat(): {
            queryFn(): Promise<{
              yummy: boolean
            }>
            queryKey: string[]
          }
          retrieveTreat: {
            (): Promise<{
              yummy: boolean
            }>
            useQuery(opts?: UseQueryOptions): ReactQuery.UseQueryResult<{
              yummy: boolean
            }>
            useSuspenseQuery(
              opts?: UseQueryOptions,
            ): ReactQuery.UseSuspenseQueryResult<{
              yummy: boolean
            }>
            useMutation(
              opts?: UseMutationOptions,
            ): ReactQuery.UseMutationResult<
              {
                yummy: boolean
              },
              unknown,
              void
            >
            getQueryKey(): string[]
          }
          useUpdate(body: { yummy: boolean }): {
            queryFn(): Promise<{
              yummy: boolean
            }>
            queryKey: string[]
          }
          update: {
            (body: { yummy: boolean }): Promise<{
              yummy: boolean
            }>
            useQuery(
              body: {
                yummy: boolean
              },
              opts?: UseQueryOptions,
            ): ReactQuery.UseQueryResult<{
              yummy: boolean
            }>
            useSuspenseQuery(
              body: {
                yummy: boolean
              },
              opts?: UseQueryOptions,
            ): ReactQuery.UseSuspenseQueryResult<{
              yummy: boolean
            }>
            useMutation(
              opts?: UseMutationOptions,
            ): ReactQuery.UseMutationResult<
              {
                yummy: boolean
              },
              unknown,
              {
                yummy: boolean
              }
            >
            getQueryKey(): string[]
          }
        }
      }
    }
  }
  users: {
    (id: string | number): {
      useUpdate(body: {
        name?: string | undefined
        email?: string | undefined
        accountType?: ("admin" | "free" | "paid") | undefined
      }): {
        queryFn(): Promise<{
          id: string
          name?: (string | null) | undefined
          email?: (string | null) | undefined
          siteWideRole: "admin" | "user"
          accountType: "admin" | "free" | "paid"
          githubUsername?: (string | null) | undefined
          createAt: string
          updatedAt: string
        }>
        queryKey: string[]
      }
      update: {
        (body: {
          name?: string | undefined
          email?: string | undefined
          accountType?: ("admin" | "free" | "paid") | undefined
        }): Promise<{
          id: string
          name?: (string | null) | undefined
          email?: (string | null) | undefined
          siteWideRole: "admin" | "user"
          accountType: "admin" | "free" | "paid"
          githubUsername?: (string | null) | undefined
          createAt: string
          updatedAt: string
        }>
        useQuery(
          body: {
            name?: string | undefined
            email?: string | undefined
            accountType?: ("admin" | "free" | "paid") | undefined
          },
          opts?: UseQueryOptions,
        ): ReactQuery.UseQueryResult<{
          id: string
          name?: (string | null) | undefined
          email?: (string | null) | undefined
          siteWideRole: "admin" | "user"
          accountType: "admin" | "free" | "paid"
          githubUsername?: (string | null) | undefined
          createAt: string
          updatedAt: string
        }>
        useSuspenseQuery(
          body: {
            name?: string | undefined
            email?: string | undefined
            accountType?: ("admin" | "free" | "paid") | undefined
          },
          opts?: UseQueryOptions,
        ): ReactQuery.UseSuspenseQueryResult<{
          id: string
          name?: (string | null) | undefined
          email?: (string | null) | undefined
          siteWideRole: "admin" | "user"
          accountType: "admin" | "free" | "paid"
          githubUsername?: (string | null) | undefined
          createAt: string
          updatedAt: string
        }>
        useMutation(opts?: UseMutationOptions): ReactQuery.UseMutationResult<
          {
            id: string
            name?: (string | null) | undefined
            email?: (string | null) | undefined
            siteWideRole: "admin" | "user"
            accountType: "admin" | "free" | "paid"
            githubUsername?: (string | null) | undefined
            createAt: string
            updatedAt: string
          },
          unknown,
          {
            name?: string | undefined
            email?: string | undefined
            accountType?: ("admin" | "free" | "paid") | undefined
          }
        >
        getQueryKey(): string[]
      }
    }
  }
}

export function makeClient(config: ClientConfig) {
  // prettier-ignore
  return makeClientWithExplicitTypes<Client>(config);
}
