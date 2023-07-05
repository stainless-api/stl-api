import { QueryClient } from "@tanstack/query-core";
import {
  AnyEndpoint,
  z,
  EndpointBodyInput,
  EndpointQueryInput,
  AnyResourceConfig,
} from "stainless";
import { ActionsForMethod, EndpointPathParam } from ".";
import { UpperFirst } from "./util";

export type ClientInvalidateQueriesMethods<Resource extends AnyResourceConfig> =
  {
    [Action in ActionsForMethod<
      Resource,
      "get"
    > as InvalidateAction<Action>]: ClientInvalidateQueries<
      Resource["actions"][Action]
    >;
  } & {
    invalidateQueries(client: QueryClient): void;
  };

export type InvalidateAction<Action extends string> =
  `invalidate${UpperFirst<Action>}`;

export type ClientInvalidateQueries<E extends AnyEndpoint> =
  E["path"] extends z.ZodTypeAny
    ? E["body"] extends z.ZodTypeAny
      ? (
          queryClient: QueryClient,
          path?: EndpointPathParam<E>,
          body?: EndpointBodyInput<E>,
          options?: { query?: EndpointQueryInput<E> }
        ) => void
      : E["query"] extends z.ZodTypeAny
      ? (
          queryClient: QueryClient,
          path?: EndpointPathParam<E>,
          query?: EndpointQueryInput<E>
        ) => void
      : (queryClient: QueryClient, path?: EndpointPathParam<E>) => void
    : E["body"] extends z.ZodTypeAny
    ? (
        queryClient: QueryClient,
        body?: EndpointBodyInput<E>,
        options?: { query?: EndpointQueryInput<E> }
      ) => void
    : E["query"] extends z.ZodTypeAny
    ? (queryClient: QueryClient, query?: EndpointQueryInput<E>) => void
    : (queryClient: QueryClient) => void;
