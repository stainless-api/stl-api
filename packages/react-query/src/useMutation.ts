import {
  z,
  type AnyEndpoint,
  type EndpointBodyInput,
  type EndpointQueryInput,
  type EndpointResponseOutput,
} from "stainless";
import { isEmpty } from "lodash";
import {
  UseMutationOptions as BaseUseMutationOptions,
  MutationObserverResult,
} from "@tanstack/react-query";
import { EndpointPathParam, KeysEnum } from ".";

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
          TContext
        >
      ) => Promise<TData>
    : E["query"] extends z.ZodTypeAny
    ? (
        path: EndpointPathParam<E>,
        query: EndpointQueryInput<E>,
        options?: MutateOptions<TData, TError, TContext>
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
        TContext
      >
    ) => Promise<TData>
  : E["query"] extends z.ZodTypeAny
  ? (
      query: EndpointQueryInput<E>,
      options?: MutateOptions<TData, TError, TContext>
    ) => Promise<TData>
  : (options?: MutateOptions<TData, TError, TContext>) => Promise<TData>;

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

export interface MutateOptions<
  TData = unknown,
  TError = unknown,
  TContext = unknown
> {
  onSuccess?: (data: TData, context: TContext) => void;
  onError?: (error: TError, context: TContext | undefined) => void;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    context: TContext | undefined
  ) => void;
}

// This is required so that we can determine if a given object matches the RequestOptions
// type at runtime. While this requires duplication, it is enforced by the TypeScript
// compiler such that any missing / extraneous keys will cause an error.
const mutateOptionsKeys: KeysEnum<MutateOptions> = {
  onSuccess: true,
  onError: true,
  onSettled: true,
};

export const isMutateOptions = (obj: unknown): obj is MutateOptions => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    !isEmpty(obj) &&
    Object.keys(obj).every((k) => Object.hasOwn(mutateOptionsKeys, k))
  );
};
