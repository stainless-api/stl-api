import { type ClientPromiseProps as BaseClientPromiseProps, ClientPromise as BaseClientPromise } from "stainless";
export type ExtractClientPromiseProps = {
    queryKey: unknown[];
};
export type ClientPromiseProps = BaseClientPromiseProps & ExtractClientPromiseProps;
export declare class ClientPromise<R> extends BaseClientPromise<R> {
    queryKey: unknown[];
    constructor(fetch: () => Promise<R>, { queryKey, ...props }: ClientPromiseProps);
    static from<R>({ fetch, method, uri, pathname, search, query }: BaseClientPromise<R>, { queryKey }: ExtractClientPromiseProps): ClientPromise<R>;
}
//# sourceMappingURL=ClientPromise.d.ts.map