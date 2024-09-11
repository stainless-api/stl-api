import {
  AnyEndpoint,
  z,
  EndpointBodyInput,
  RequestOptions,
  EndpointQueryInput,
  AnyResourceConfig,
} from "stainless";
import { ClientPromise, PaginatorPromise, EndpointPathParam } from "./index.js";

export type ClientMethods<Resource extends AnyResourceConfig> = {
  [Action in keyof Resource["actions"]]: Resource["actions"][Action] extends AnyEndpoint
    ? ClientMethodAndOperations<Resource["actions"][Action]>
    : never;
};

type ExtractClientResponse<E extends AnyEndpoint> = z.infer<
  E["response"]
> extends z.PageData<any>
  ? PaginatorPromise<z.infer<E["response"]>>
  : E["response"] extends z.ZodTypeAny
  ? ClientPromise<z.infer<E["response"]>>
  : ClientPromise<undefined>;

type ClientMethodAndOperations<E extends AnyEndpoint> = ClientMethod<E> & {
  getQueryKey: PartialQueryKeyMethod<E, unknown[]>;
};

type ClientMethod<
  E extends AnyEndpoint,
  Response = ExtractClientResponse<E>
> = E["path"] extends z.ZodTypeAny
  ? E["body"] extends z.ZodTypeAny
    ? (
        path: EndpointPathParam<E>,
        body: EndpointBodyInput<E>,
        options?: RequestOptions<EndpointQueryInput<E>>
      ) => Response
    : E["query"] extends z.ZodTypeAny
    ? {} extends EndpointQueryInput<E>
      ? (
          path: EndpointPathParam<E>,
          query?: EndpointQueryInput<E>,
          options?: RequestOptions
        ) => Response
      : (
          path: EndpointPathParam<E>,
          query: EndpointQueryInput<E>,
          options?: RequestOptions
        ) => Response
    : (path: EndpointPathParam<E>, options?: RequestOptions) => Response
  : E["body"] extends z.ZodTypeAny
  ? (
      body: EndpointBodyInput<E>,
      options?: RequestOptions<EndpointQueryInput<E>>
    ) => Response
  : E["query"] extends z.ZodTypeAny
  ? {} extends EndpointQueryInput<E>
    ? (query?: EndpointQueryInput<E>, options?: RequestOptions) => Response
    : (query: EndpointQueryInput<E>, options?: RequestOptions) => Response
  : (options?: RequestOptions) => Response;

type PartialQueryKeyMethod<
  E extends AnyEndpoint,
  Response = ExtractClientResponse<E>
> = E["path"] extends z.ZodTypeAny
  ? E["body"] extends z.ZodTypeAny
    ? (
        path?: EndpointPathParam<E>,
        body?: EndpointBodyInput<E>,
        options?: { query?: EndpointQueryInput<E> }
      ) => Response
    : E["query"] extends z.ZodTypeAny
    ? (path?: EndpointPathParam<E>, query?: EndpointQueryInput<E>) => Response
    : (path?: EndpointPathParam<E>) => Response
  : E["body"] extends z.ZodTypeAny
  ? (
      body?: EndpointBodyInput<E>,
      options?: { query?: EndpointQueryInput<E> }
    ) => Response
  : E["query"] extends z.ZodTypeAny
  ? (query?: EndpointQueryInput<E>) => Response
  : () => Response;
