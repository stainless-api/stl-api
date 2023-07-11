import {
  z,
  type AnyEndpoint,
  type EndpointBodyInput,
  type EndpointQueryInput,
  type EndpointResponseOutput,
} from "stainless";
import {
  UseMutationOptions as BaseUseMutationOptions,
  MutateOptions,
  MutationObserverResult,
} from "@tanstack/react-query";
import { EndpointPathParam } from ".";

export type ClientUseMutation<
  E extends AnyEndpoint,
  TData = EndpointResponseOutput<E>,
  TError = unknown,
  TContext = unknown
> = (
  options?: UseMutationOptions<E, TData, TError, TContext>
) => ClientUseMutationResult<E, TData, TError, TContext>;

type UseMutationOptions<
  E extends AnyEndpoint,
  TData = EndpointResponseOutput<E>,
  TError = unknown,
  TContext = unknown
> = Omit<BaseUseMutationOptions<TData, TError, void, TContext>, "mutationFn">;

type ClientMutateFunction<
  E extends AnyEndpoint,
  TData = EndpointResponseOutput<E>,
  TError = unknown,
  TContext = unknown
> = E["path"] extends z.ZodTypeAny
  ? E["body"] extends z.ZodTypeAny
    ? (
        path: EndpointPathParam<E>,
        body: EndpointBodyInput<E>,
        options?: { query?: EndpointQueryInput<E> } & MutateOptions<
          TData,
          TError,
          void,
          TContext
        >
      ) => Promise<TData>
    : E["query"] extends z.ZodTypeAny
    ? (
        path: EndpointPathParam<E>,
        options?: { query?: EndpointQueryInput<E> } & MutateOptions<
          TData,
          TError,
          void,
          TContext
        >
      ) => Promise<TData>
    : (
        path: EndpointPathParam<E>,
        options?: MutateOptions<TData, TError, TContext>
      ) => Promise<TData>
  : E["body"] extends z.ZodTypeAny
  ? (
      body: EndpointBodyInput<E>,
      options?: { query?: EndpointQueryInput<E> } & MutateOptions<
        TData,
        TError,
        void,
        TContext
      >
    ) => Promise<TData>
  : (
      options?: { query?: EndpointQueryInput<E> } & MutateOptions<
        TData,
        TError,
        void,
        TContext
      >
    ) => Promise<TData>;

type ClientUseMutateFunction<
  E extends AnyEndpoint,
  TData = EndpointResponseOutput<E>,
  TError = unknown,
  TContext = unknown
> = (
  ...args: Parameters<ClientMutateFunction<E, TData, TError, TContext>>
) => void;

type ClientUseMutateAsyncFunction<
  E extends AnyEndpoint,
  TData = EndpointResponseOutput<E>,
  TError = unknown,
  TContext = unknown
> = ClientMutateFunction<E, TData, TError, TContext>;

type Override<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] };

export type ClientUseMutationResult<
  E extends AnyEndpoint,
  TData = EndpointResponseOutput<E>,
  TError = unknown,
  TContext = unknown
> = Override<
  MutationObserverResult<E, TData, TError, TContext>,
  { mutate: ClientUseMutateFunction<E, TData, TError, TContext> }
> & { mutateAsync: ClientUseMutateAsyncFunction<E, TData, TError, TContext> };
