import {
  AnyEndpoint,
  z,
  PaginatorPromise,
  ClientPromise,
  EndpointBodyInput,
  RequestOptions,
  EndpointQueryInput,
  AnyResourceConfig,
} from "stainless";
import { EndpointPathParam } from ".";

export type ClientMethods<Resource extends AnyResourceConfig> = {
  [Action in keyof Resource["actions"]]: Resource["actions"][Action] extends AnyEndpoint
    ? ClientMethod<Resource["actions"][Action]>
    : never;
};

type ExtractClientResponse<E extends AnyEndpoint> = z.infer<
  E["response"]
> extends z.PageData<any>
  ? PaginatorPromise<z.infer<E["response"]>>
  : E["response"] extends z.ZodTypeAny
  ? ClientPromise<z.infer<E["response"]>>
  : ClientPromise<undefined>;

type ClientMethod<E extends AnyEndpoint> = E["path"] extends z.ZodTypeAny
  ? E["body"] extends z.ZodTypeAny
    ? (
        path: EndpointPathParam<E>,
        body: EndpointBodyInput<E>,
        options?: RequestOptions<EndpointQueryInput<E>>
      ) => ExtractClientResponse<E>
    : E["query"] extends z.ZodTypeAny
    ? (
        path: EndpointPathParam<E>,
        query: EndpointQueryInput<E>,
        options?: RequestOptions
      ) => ExtractClientResponse<E>
    : (
        path: EndpointPathParam<E>,
        options?: RequestOptions
      ) => ExtractClientResponse<E>
  : E["body"] extends z.ZodTypeAny
  ? (
      body: EndpointBodyInput<E>,
      options?: RequestOptions<EndpointQueryInput<E>>
    ) => ExtractClientResponse<E>
  : E["query"] extends z.ZodTypeAny
  ? (
      query: EndpointQueryInput<E>,
      options?: RequestOptions
    ) => ExtractClientResponse<E>
  : (options?: RequestOptions) => ExtractClientResponse<E>;
