import {
  type ClientPromiseProps as BaseClientPromiseProps,
  ClientPromise as BaseClientPromise,
} from "stainless";

export type ExtractClientPromiseProps = {
  queryKey: unknown[];
};

export type ClientPromiseProps = BaseClientPromiseProps &
  ExtractClientPromiseProps;

export class ClientPromise<R> extends BaseClientPromise<R> {
  queryKey: unknown[];

  constructor(
    fetch: () => Promise<R>,
    { queryKey, ...props }: ClientPromiseProps,
  ) {
    super(fetch, props);
    this.queryKey = queryKey;
  }

  static from<R>(
    { fetch, method, uri, pathname, search, query }: BaseClientPromise<R>,
    { queryKey }: ExtractClientPromiseProps,
  ): ClientPromise<R> {
    return new ClientPromise(fetch, {
      method,
      uri,
      pathname,
      search,
      query,
      queryKey,
    });
  }
}
