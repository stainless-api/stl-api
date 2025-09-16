var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { PaginatorPromise as BasePaginatorPromise } from "stainless";
export class PaginatorPromise extends BasePaginatorPromise {
    constructor(fetch, _a) {
        var { queryKey } = _a, props = __rest(_a, ["queryKey"]);
        super(fetch, props);
        this.queryKey = queryKey;
    }
    static from({ fetch, method, uri, pathname, search, query }, { queryKey }) {
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
//# sourceMappingURL=PaginatorPromise.js.map