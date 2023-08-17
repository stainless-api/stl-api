import { z, Page, PaginatorPromise as BasePaginatorPromise } from "stainless";
import { ClientPromiseProps, ExtractClientPromiseProps } from "./ClientPromise";
export declare class PaginatorPromise<D extends z.PageData<any>> extends BasePaginatorPromise<D> {
    queryKey: unknown[];
    constructor(fetch: () => Promise<Page<D>>, { queryKey, ...props }: ClientPromiseProps);
    static from<D extends z.PageData<any>>({ fetch, method, uri, pathname, search, query }: BasePaginatorPromise<D>, { queryKey }: ExtractClientPromiseProps): PaginatorPromise<D>;
}
//# sourceMappingURL=PaginatorPromise.d.ts.map