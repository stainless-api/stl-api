import {
  z,
  type AnyEndpoint,
  type EndpointBodyInput,
  type EndpointQueryInput,
  type EndpointResponseOutput,
  type EndpointHasRequiredQuery,
} from "stainless";
import {
  UseMutationOptions as BaseUseMutationOptions,
  MutateOptions as BaseMutateOptions,
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

export type UseMutationOptions<
  E extends AnyEndpoint,
  TData = EndpointResponseOutput<E>,
  TError = unknown,
  TContext = unknown
> = Omit<BaseUseMutationOptions<TData, TError, void, TContext>, "mutationFn">;

export type MutateOptions<
  E extends AnyEndpoint,
  TData = EndpointResponseOutput<E>,
  TError = unknown,
  TContext = unknown
> = BaseMutateOptions<TData, TError, void, TContext> &
  (E["query"] extends z.ZodTypeAny
    ? {} extends EndpointQueryInput<E>
      ? { query?: EndpointQueryInput<E> }
      : { query: EndpointQueryInput<E> }
    : {});

export function isMutateOptions(o: any): o is MutateOptions<AnyEndpoint> {
  return (
    o != null &&
    typeof o === "object" &&
    (typeof o.onSuccess === "function" ||
      typeof o.onError === "function" ||
      typeof o.onSettled === "function" ||
      (o.query != null && typeof o.query === "object"))
  );
}

export type ClientMutateFunction<
  E extends AnyEndpoint,
  TData = EndpointResponseOutput<E>,
  TError = unknown,
  TContext = unknown
> = E["path"] extends z.ZodTypeAny
  ? E["body"] extends z.ZodTypeAny
    ? EndpointHasRequiredQuery<E> extends true
      ? (
          path: EndpointPathParam<E>,
          body: EndpointBodyInput<E>,
          options: MutateOptions<E, TData, TError, TContext>
        ) => Promise<TData>
      : (
          path: EndpointPathParam<E>,
          body: EndpointBodyInput<E>,
          options?: MutateOptions<E, TData, TError, TContext>
        ) => Promise<TData>
    : EndpointHasRequiredQuery<E> extends true
    ? (
        path: EndpointPathParam<E>,
        options: MutateOptions<E, TData, TError, TContext>
      ) => Promise<TData>
    : (
        path: EndpointPathParam<E>,
        options?: MutateOptions<E, TData, TError, TContext>
      ) => Promise<TData>
  : E["body"] extends z.ZodTypeAny
  ? EndpointHasRequiredQuery<E> extends true
    ? (
        body: EndpointBodyInput<E>,
        options: MutateOptions<E, TData, TError, TContext>
      ) => Promise<TData>
    : (
        body: EndpointBodyInput<E>,
        options?: MutateOptions<E, TData, TError, TContext>
      ) => Promise<TData>
  : EndpointHasRequiredQuery<E> extends true
  ? (options: MutateOptions<E, TData, TError, TContext>) => Promise<TData>
  : (options?: MutateOptions<E, TData, TError, TContext>) => Promise<TData>;

export type ClientUseMutateFunction<
  E extends AnyEndpoint,
  TData = EndpointResponseOutput<E>,
  TError = unknown,
  TContext = unknown
> = (
  ...args: Parameters<ClientMutateFunction<E, TData, TError, TContext>>
) => void;

export type ClientUseMutateAsyncFunction<
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
  MutationObserverResult<TData, TError, void, TContext>,
  { mutate: ClientUseMutateFunction<E, TData, TError, TContext> }
> & { mutateAsync: ClientUseMutateAsyncFunction<E, TData, TError, TContext> };
