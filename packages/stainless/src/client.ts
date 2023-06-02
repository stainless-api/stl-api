import qs from "qs";
import { createRecursiveProxy } from "./createRecursiveProxy";
import {
  z,
  AnyAPIDescription,
  AnyEndpoint,
  AnyResourceConfig,
  ResourceConfig,
  HttpMethod,
} from "./stl";
import { isEmpty, once } from "lodash";

type ValueOf<T extends object> = T[keyof T];

type ExtractClientPath<E extends AnyEndpoint> = E["path"] extends z.ZodTypeAny
  ? ValueOf<z.input<E["path"]>>
  : undefined;
type ExtractClientQuery<E extends AnyEndpoint> = E["query"] extends z.ZodTypeAny
  ? z.input<E["query"]>
  : undefined;
type ExtractClientBody<E extends AnyEndpoint> = E["body"] extends z.ZodTypeAny
  ? z.input<E["body"]>
  : undefined;

type ExtractClientResponse<E extends AnyEndpoint> = z.infer<
  E["response"]
> extends z.PageData<any>
  ? PaginatorPromise<z.infer<E["response"]>>
  : E["response"] extends z.ZodTypeAny
  ? ClientPromise<z.infer<E["response"]>>
  : ClientPromise<undefined>;

export type StainlessClient<Api extends AnyAPIDescription> = ClientResource<
  ResourceConfig<
    Api["topLevel"]["actions"],
    Api["resources"],
    Api["topLevel"]["models"]
  >
>;

type ClientResource<Resource extends AnyResourceConfig> = {
  [Action in keyof Resource["actions"]]: Resource["actions"][Action] extends AnyEndpoint
    ? ClientFunction<Resource["actions"][Action]>
    : never;
} & {
  [S in keyof Resource["namespacedResources"]]: ClientResource<
    Resource["namespacedResources"][S]
  >;
};

type ClientFunction<E extends AnyEndpoint> = E["path"] extends z.ZodTypeAny
  ? E["body"] extends z.ZodTypeAny
    ? (
        path: ExtractClientPath<E>,
        body: ExtractClientBody<E>,
        options?: { query?: ExtractClientQuery<E> }
      ) => ExtractClientResponse<E>
    : E["query"] extends z.ZodTypeAny
    ? (
        path: ExtractClientPath<E>,
        query: ExtractClientQuery<E>
      ) => ExtractClientResponse<E>
    : (path: ExtractClientPath<E>) => ExtractClientResponse<E>
  : E["body"] extends z.ZodTypeAny
  ? (
      body: ExtractClientBody<E>,
      options?: { query?: ExtractClientQuery<E> }
    ) => ExtractClientResponse<E>
  : E["query"] extends z.ZodTypeAny
  ? (query: ExtractClientQuery<E>) => ExtractClientResponse<E>
  : () => ExtractClientResponse<E>;

function actionMethod(action: string): HttpMethod {
  if (/^(get|list)([_A-Z]|$)/.test(action)) return "get";
  if (/^delete([_A-Z]|$)/.test(action)) return "delete";
  // TODO: is it possible to deal with patch/put?
  return "post";
}

export function createClient<Api extends AnyAPIDescription>(
  baseUrl: string,
  options?: { fetch?: typeof fetch }
): StainlessClient<Api> {
  const client = createRecursiveProxy((opts) => {
    const callPath = [...opts.path]; // e.g. ["issuing", "cards", "create"]
    const action = callPath.pop()!; // TODO validate
    const { args } = opts;
    let requestOptions: RequestOptions<any> | undefined;

    let path = callPath.join("/"); // eg; /issuing/cards
    if (typeof args[0] === "string" || typeof args[0] === "number") {
      path += `/${encodeURIComponent(args.shift() as string | number)}`;
    }

    if (isRequestOptions(args.at(-1))) {
      requestOptions = args.shift() as any;
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
      const json = await (options?.fetch || fetch)(uri, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...requestOptions?.headers,
        },
        body: body ? JSON.stringify(body) : undefined, // TODO: don't include on GET
      }).then(async (res) => {
        const responsebody = await res.text();
        try {
          return JSON.parse(responsebody);
        } catch (e) {
          console.error("Could not parse json", responsebody);
        }
      });

      if ("error" in json) {
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
      cacheKey,
    };

    return action === "list"
      ? new PaginatorPromise(doFetch, promiseProps)
      : new ClientPromise(doFetch, promiseProps);
  }, []) as StainlessClient<Api>;
  return client;
}

export type Headers = Record<string, string | null | undefined>;
export type KeysEnum<T> = { [P in keyof Required<T>]: true };

export type RequestOptions<Req extends {} = Record<string, unknown>> = {
  method?: HttpMethod;
  path?: string;
  query?: Req | undefined;
  body?: Req | undefined;
  headers?: Headers | undefined;

  maxRetries?: number;
  stream?: boolean | undefined;
  timeout?: number;
  idempotencyKey?: string;
};

// This is required so that we can determine if a given object matches the RequestOptions
// type at runtime. While this requires duplication, it is enforced by the TypeScript
// compiler such that any missing / extraneous keys will cause an error.
const requestOptionsKeys: KeysEnum<RequestOptions> = {
  method: true,
  path: true,
  query: true,
  body: true,
  headers: true,

  maxRetries: true,
  stream: true,
  timeout: true,
  idempotencyKey: true,
};

export const isRequestOptions = (obj: unknown): obj is RequestOptions => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    !isEmpty(obj) &&
    Object.keys(obj).every((k) => Object.hasOwn(requestOptionsKeys, k))
  );
};

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

  declare items: z.PageItemType<D>[];
  declare startCursor: string | null;
  declare endCursor: string | null;
  declare hasNextPage: boolean | undefined;
  declare hasPreviousPage: boolean | undefined;

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

  getPreviousPageParam(): string | null {
    return this.data.startCursor;
  }

  getPreviousPageUrl(): string {
    return `${this.pathname}/${qs.stringify(this.getPreviousPageParams())}`;
  }

  async getPreviousPage(): Promise<Page<D>> {
    return await this.clientPath
      .reduce((client: any, path) => client[path], this.client)
      .list(this.getPreviousPageParams());
  }

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

  getNextPageParam(): string | null {
    return this.data.endCursor;
  }

  getNextPageUrl(): string {
    return `${this.pathname}/${qs.stringify(this.getNextPageParams())}`;
  }

  async getNextPage(): Promise<Page<D>> {
    return await this.clientPath
      .reduce((client: any, path) => client[path], this.client)
      .list(this.getNextPageParams());
  }
}

type ClientPromiseProps = {
  method: HttpMethod;
  uri: string;
  pathname: string;
  search: string;
  query: Record<string, any>;
  cacheKey: string;
};

class ClientPromise<R> implements Promise<R> {
  fetch: () => Promise<R>;
  method: HttpMethod;
  uri: string;
  pathname: string;
  search: string;
  query: Record<string, any>;
  cacheKey: string;

  constructor(fetch: () => Promise<R>, props: ClientPromiseProps) {
    this.fetch = once(fetch);
    this.method = props.method;
    this.uri = props.uri;
    this.pathname = props.pathname;
    this.search = props.search;
    this.query = props.query;
    this.cacheKey = props.cacheKey;
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

export type { ClientPromise };

/**
 * The result of client.???.list, can be awaited like a
 * Promise to get a single page, or async iterated to go through
 * all items
 */
class PaginatorPromise<D extends z.PageData<any>>
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

export type { PaginatorPromise };
