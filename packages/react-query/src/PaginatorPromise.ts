import { z, Page, PaginatorPromise as BasePaginatorPromise } from "stainless";
import {
  ClientPromiseProps,
  ExtractClientPromiseProps,
} from "./ClientPromise.js";

export class PaginatorPromise<
  D extends z.PageData<any>
> extends BasePaginatorPromise<D> {
  queryKey: unknown[];

  constructor(
    fetch: () => Promise<Page<D>>,
    { queryKey, ...props }: ClientPromiseProps
  ) {
    super(fetch, props);
    this.queryKey = queryKey;
  }

  static from<D extends z.PageData<any>>(
    { fetch, method, uri, pathname, search, query }: BasePaginatorPromise<D>,
    { queryKey }: ExtractClientPromiseProps
  ): PaginatorPromise<D> {
    return new PaginatorPromise(fetch, {
      method,
      uri,
      pathname,
      search,
      query,
      queryKey,
    });
  }
}
