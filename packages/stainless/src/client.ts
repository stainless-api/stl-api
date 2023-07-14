import qs from "qs";
import { createRecursiveProxy } from "./createRecursiveProxy";
import {
  z,
  AnyAPIDescription,
  AnyEndpoint,
  AnyResourceConfig,
  ResourceConfig,
  HttpMethod,
  EndpointPathInput,
  EndpointBodyInput,
  EndpointQueryInput,
  EndpointHasRequiredQuery,
} from "./stl";
import { isEmpty, once } from "lodash";

type ValueOf<T extends object> = T[keyof T];

type EndpointPathParam<E extends AnyEndpoint> =
  EndpointPathInput<E> extends object
    ? ValueOf<EndpointPathInput<E>>
    : undefined;

type ExtractClientResponse<E extends AnyEndpoint> =
  E["response"] extends z.ZodTypeAny
    ? z.infer<E["response"]> extends z.PageData<any>
      ? PaginatorPromise<z.infer<E["response"]>>
      : ClientPromise<z.infer<E["response"]>>
    : ClientPromise<undefined>;

/**
 * A client for making requests to the REST API described by the `Api` type.
 *
 * The client allows for performing REST operations idiomatically by utilizing
 * the resources and endpoints declared on the API. A resource's endpoints
 * are available on the client as methods on a field with the name of the
 * resource.
 *
 * ## Example
 * ```ts
 * // api/users/index.ts
 * import { stl } from "~/libs/stl";
 * import { retrieve } from "./retrieve";
 * import { User } from "./models";
 *
 * export const users = stl.resource({
 *   summary: "Users",
 *   models: {
 *     User,
 *   },
 *   actions: {
 *     retrieve,
 *   },
 * });
 *
 * // app/users/[userId]/page.tsx
 * ...
 * // `users` refers to the resource by the same name, `retrieve` refers
 * // to the endpoint on `users` by the same name
 * const user = client.users.retrieve(userId);
 * ...
 *
 * ## Implementation note
 * In order to decrease build times and bundle sizes, the
 * `stainless` client utilizes proxies in order to provide a mapping
 * to the server API. This means that resource and endpoint fields and methods
 * cannot be found within source code. Autocomplete and type definitions
 * within a Typescript LSP-enabled editor are good ways of understanding
 * the shape of the client API.
 * ```
 */
export type StainlessClient<Api extends AnyAPIDescription> = ClientResource<
  ResourceConfig<
    Api["topLevel"]["actions"],
    Api["resources"],
    Api["topLevel"]["models"]
  >
>;

type ClientResource<Resource extends AnyResourceConfig> =
  (string extends keyof Resource["actions"]
    ? {}
    : {
        [Action in keyof Resource["actions"]]: Resource["actions"][Action] extends AnyEndpoint
          ? ClientFunction<Resource["actions"][Action]>
          : never;
      }) & {
    [S in keyof Resource["namespacedResources"]]: ClientResource<
      Resource["namespacedResources"][S]
    >;
  };

type ClientFunction<E extends AnyEndpoint> = E["path"] extends z.ZodTypeAny
  ? E["body"] extends z.ZodTypeAny
    ? EndpointHasRequiredQuery<E> extends true
      ? (
          path: EndpointPathParam<E>,
          body: EndpointBodyInput<E>,
          options: RequestOptions<EndpointQueryInput<E>>
        ) => ExtractClientResponse<E>
      : (
          path: EndpointPathParam<E>,
          body: EndpointBodyInput<E>,
          options?: RequestOptions<EndpointQueryInput<E>>
        ) => ExtractClientResponse<E>
    : E["query"] extends z.ZodTypeAny
    ? EndpointHasRequiredQuery<E> extends true
      ? (
          path: EndpointPathParam<E>,
          query: EndpointQueryInput<E>,
          options?: RequestOptions
        ) => ExtractClientResponse<E>
      : (
          path: EndpointPathParam<E>,
          query?: EndpointQueryInput<E>,
          options?: RequestOptions
        ) => ExtractClientResponse<E>
    : (
        path: EndpointPathParam<E>,
        options?: RequestOptions
      ) => ExtractClientResponse<E>
  : E["body"] extends z.ZodTypeAny
  ? EndpointHasRequiredQuery<E> extends true
    ? (
        body: EndpointBodyInput<E>,
        options: RequestOptions<EndpointQueryInput<E>>
      ) => ExtractClientResponse<E>
    : (
        body: EndpointBodyInput<E>,
        options?: RequestOptions<EndpointQueryInput<E>>
      ) => ExtractClientResponse<E>
  : E["query"] extends z.ZodTypeAny
  ? EndpointHasRequiredQuery<E> extends true
    ? (
        query: EndpointQueryInput<E>,
        options?: RequestOptions
      ) => ExtractClientResponse<E>
    : (
        query?: EndpointQueryInput<E>,
        options?: RequestOptions
      ) => ExtractClientResponse<E>
  : (options?: RequestOptions) => ExtractClientResponse<E>;

function actionMethod(action: string): HttpMethod {
  if (/^(get|list|retrieve)([_A-Z]|$)/.test(action)) return "get";
  if (/^delete([_A-Z]|$)/.test(action)) return "delete";
  // TODO: is it possible to deal with patch/put?
  return "post";
}

/**
 * Thrown when a non-success HTTP status code is encountered by the client.
 */
class HTTPResponseError extends Error {
  /**
   * @param response the unsuccessful response
   */
  constructor(public response: Response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`);
  }
}

/** Options for the {@link createClient} function. */
interface CreateClientOptions {
  /** Replaces the default global `fetch` function to make requests. */
  fetch?: typeof fetch;
}

/**
 * Creates a client for making requests against a `stainless` framework API.
 * For usage information see {@link StainlessClient}.
 *
 * @param baseUrl the url to prepend to all request paths
 * @param options options to customize client behavior
 * @returns client
 *
 * ## Example
 * ```ts
 * // ~/api/client.ts
 * import { createClient } from "stainless";
 * import type { api } from "./index";
 *
 * export const client = createClient<typeof api>("/api");
 * ```
 *
 * ## Client-server separation
 * In order to get a client with correct typing information, it's necessary
 * to import the type of the API from server-side code. This does not expose
 * server-side code or secrets to users because types are transpile-time
 * constructs. Importing values or functions from server-side code, however,
 * would result in this being included in client-side bundles.
 */
export function createClient<Api extends AnyAPIDescription>(
  baseUrl: string,
  options?: CreateClientOptions
): StainlessClient<Api> {
  const checkStatus = (response: Response) => {
    if (response.ok) {
      // response.status >= 200 && response.status < 300
      return response;
    } else {
      throw new HTTPResponseError(response);
    }
  };

  const client = createRecursiveProxy((opts) => {
    const args = [...opts.args];
    const callPath = [...opts.path]; // e.g. ["issuing", "cards", "create"]
    const action = callPath.pop()!; // TODO validate
    let requestOptions: RequestOptions<any> | undefined;

    let path = callPath.join("/"); // eg; /issuing/cards
    if (typeof args[0] === "string" || typeof args[0] === "number") {
      path += `/${encodeURIComponent(args.shift() as string | number)}`;
    }

    if (isRequestOptions(args.at(-1))) {
      requestOptions = args.pop() as any;
    }
    const method = actionMethod(action);

    const body = method === "get" ? undefined : args[0];

    const pathname = `${baseUrl}/${path}`;
    let uri = pathname;

    const query: Record<string, any> = {
      ...(method === "get" && typeof args[0] === "object" ? args[0] : null),
      ...requestOptions?.query,
    };
    let search = "";
    if (query && Object.keys(query).length) {
      search = `?${qs.stringify(query)}`;
      uri += search;
    }

    let cacheKey = uri;
    if (action === "list") {
      const { pageSize, sortDirection = "asc", ...restQuery } = query;
      cacheKey = `${pathname}?${qs.stringify({ ...restQuery, sortDirection })}`;
    }

    const doFetch = async () => {
      const res = await (options?.fetch || fetch)(uri, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...requestOptions?.headers,
        },
        body: body ? JSON.stringify(body) : undefined, // TODO: don't include on GET
      });
      checkStatus(res);
      const responsebody = await res.text();
      let json;
      try {
        json = JSON.parse(responsebody);
      } catch (e) {
        console.error("Could not parse json", responsebody);
      }

      if (json && "error" in json) {
        throw new Error(`Error: ${json.error.message}`);
      }

      const parsed = z.AnyPageData.safeParse(json);
      if (parsed.success) {
        return new PageImpl(
          client,
          opts.path,
          pathname,
          query as any,
          parsed.data
        );
      }
      return json;
    };

    const promiseProps = {
      method,
      uri,
      pathname,
      search,
      query,
    };

    return action === "list"
      ? new PaginatorPromise(doFetch, promiseProps)
      : new ClientPromise(doFetch, promiseProps);
  }, []) as StainlessClient<Api>;
  return client;
}

/** A record of HTTP header names and values. */
export type Headers = Record<string, string | null | undefined>;
export type KeysEnum<T> = { [P in keyof Required<T>]: true };

/**
 * Request options to customize the behavior of a
 * {@link StainlessClient} request.
 */

// TODO most of these are unimplemented
export type RequestOptions<Req extends {} | undefined = undefined> = {
  /** Override the method with which to perform the request. */
  // method?: HttpMethod;
  /** Override the path at which to make the request. */
  // path?: string;
  /** Provide query parameters for the request. */
  query?: Req | undefined;
  /** Provide body parameters for the request. */
  // body?: Req | undefined;
  /** Provide HTTP headers to send with the request. */
  headers?: Headers | undefined;

  /** The maximum number of times to retry a request. Defaults to 0. */
  // maxRetries?: number;
  /** Whether to stream the response. */
  // stream?: boolean | undefined;
  /** The number of milliseconds before the request times out. */
  // timeout?: number;
  /**
   * Make the request idempotent. Assuming server-side support,
   * if the request is performed multiple times, the requested action will
   * be performed at most once for a given value of the key.
   */
  // idempotencyKey?: string;
};

// This is required so that we can determine if a given object matches the RequestOptions
// type at runtime. While this requires duplication, it is enforced by the TypeScript
// compiler such that any missing / extraneous keys will cause an error.
const requestOptionsKeys: KeysEnum<RequestOptions> = {
  // method: true,
  // path: true,
  query: true,
  // body: true,
  headers: true,

  // maxRetries: true,
  // stream: true,
  // timeout: true,
  // idempotencyKey: true,
};

const isRequestOptions = (obj: unknown): obj is RequestOptions => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    !isEmpty(obj) &&
    Object.keys(obj).every((k) => Object.hasOwn(requestOptionsKeys, k))
  );
};

/** Fetched page data, along with associated pagination state. */
export type Page<D extends z.PageData<any>> = PageImpl<D> & D;

export class PageImpl<D extends z.PageData<any>> {
  constructor(
    private client: StainlessClient<any>,
    private clientPath: string[],
    private pathname: string,
    private params: z.infer<typeof z.PaginationParams>,
    public data: D
  ) {
    Object.assign(this, data);
  }

  /** The items in a page. */
  declare items: z.PageItemType<D>[];
  /** The cursor referring to the first element in the page, if present. */
  declare startCursor: string | null;
  /**
   * The cursor referring to the one past the last element in the page,
   * if present.
   */
  declare endCursor: string | null;
  /** If known, whether there is a page after the current one. */
  declare hasNextPage: boolean | undefined;
  /** If known, whether there is a page before the current one. */
  declare hasPreviousPage: boolean | undefined;

  /**
   * Get params to access previous page.
   * @throws if there is no `startCursor`.
   */
  getPreviousPageParams(): z.PaginationParams {
    const { startCursor } = this.data;
    if (startCursor == null) {
      throw new Error(
        `response doesn't have startCursor, can't get previous page`
      );
    }
    const {
      pageSize,
      sortBy,
      sortDirection,
      // eslint-disable-next-line no-unused-vars
      pageAfter: _pageAfter,
      // eslint-disable-next-line no-unused-vars
      pageBefore: _pageBefore,
      ...rest
    } = this.params;
    return {
      ...rest,
      pageSize,
      sortBy,
      sortDirection,
      pageBefore: startCursor,
    };
  }

  /** Gets the cursor to access the previous page. */
  getPreviousPageParam(): string | null {
    return this.data.startCursor;
  }

  /**
   * Gets the URL at which to access the previous page.
   * @throws if there is no `startCursor`.
   */
  getPreviousPageUrl(): string {
    return `${this.pathname}/${qs.stringify(this.getPreviousPageParams())}`;
  }

  /**
   * Gets the previous page.
   * @throws if there is no `startCursor`.
   */
  async getPreviousPage(): Promise<Page<D>> {
    return await this.clientPath.reduce(
      (client: any, path) => client[path],
      this.client
    )(this.getPreviousPageParams());
  }

  /**
   * Get params to access the next page.
   * @throws if there is no `endCursor`.
   */
  getNextPageParams(): z.PaginationParams {
    const { endCursor } = this.data;
    if (endCursor == null) {
      throw new Error(`response doesn't have endCursor, can't get next page`);
    }
    const {
      pageSize,
      sortBy,
      sortDirection,
      // eslint-disable-next-line no-unused-vars
      pageAfter: _pageAfter,
      // eslint-disable-next-line no-unused-vars
      pageBefore: _pageBefore,
      ...rest
    } = this.params;
    return {
      ...rest,
      pageSize,
      sortBy,
      sortDirection,
      pageAfter: endCursor,
    };
  }

  /** Gets the cursor to access the next page. */
  getNextPageParam(): string | null {
    return this.data.endCursor;
  }

  /**
   * Gets the URL at which to access the next page.
   * @throws if there is no `endCursor`.
   */
  getNextPageUrl(): string {
    return `${this.pathname}/${qs.stringify(this.getNextPageParams())}`;
  }

  /**
   * Gets the next page.
   * @throws if there is no `endCursor`.
   */
  async getNextPage(): Promise<Page<D>> {
    return await this.clientPath.reduce(
      (client: any, path) => client[path],
      this.client
    )(this.getNextPageParams());
  }
}

export type ClientPromiseProps = {
  method: HttpMethod;
  uri: string;
  pathname: string;
  search: string;
  query: Record<string, any>;
};

/** A promise returned by {@link StainlessClient} requests. */
export class ClientPromise<R> implements Promise<R> {
  fetch: () => Promise<R>;
  method: HttpMethod;
  uri: string;
  pathname: string;
  search: string;
  query: Record<string, any>;

  constructor(fetch: () => Promise<R>, props: ClientPromiseProps) {
    this.fetch = once(fetch);
    this.method = props.method;
    this.uri = props.uri;
    this.pathname = props.pathname;
    this.search = props.search;
    this.query = props.query;
  }

  then<TResult1 = R, TResult2 = never>(
    onfulfilled?:
      | ((value: R) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    return this.fetch().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<R | TResult> {
    return this.fetch().catch(onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null): Promise<R> {
    return this.fetch().finally(onfinally);
  }

  get [Symbol.toStringTag]() {
    return "ClientPromise";
  }
}

/**
 * The result of client.???.list, can be awaited like a
 * `Promise` to get a single page, or async iterated to go through
 * all items.
 */
export class PaginatorPromise<D extends z.PageData<any>>
  extends ClientPromise<Page<D>>
  implements AsyncIterable<z.PageItemType<D>>
{
  constructor(fetch: () => Promise<Page<D>>, props: ClientPromiseProps) {
    super(fetch, props);
  }

  async *[Symbol.asyncIterator](): AsyncIterator<z.PageItemType<D>> {
    let page: Page<D> | undefined = await this;
    while (page) {
      yield* page.items;
      page = page.hasNextPage ? await page.getNextPage() : undefined;
    }
  }

  get [Symbol.toStringTag]() {
    return "PaginatorPromise";
  }
}
