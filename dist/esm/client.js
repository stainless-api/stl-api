var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
import qs from "qs";
import { createRecursiveProxy } from "./createRecursiveProxy";
import { z, } from "./stl";
import { isEmpty, once } from "lodash";
function actionMethod(action) {
    if (/^(get|list|retrieve)([_A-Z]|$)/.test(action))
        return "GET";
    if (/^delete([_A-Z]|$)/.test(action))
        return "DELETE";
    // TODO: is it possible to deal with patch/put?
    return "POST";
}
/**
 * Thrown when a non-success HTTP status code is encountered by the client.
 */
class HTTPResponseError extends Error {
    /**
     * @param response the unsuccessful response
     */
    constructor(response) {
        super(`HTTP Error Response: ${response.status} ${response.statusText}`);
        this.response = response;
    }
}
export function guessRequestEndpoint(baseUrl, callPath, action) {
    return `${actionMethod(action)} ${baseUrl}/${callPath.join("/")}`;
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
export function createClient(baseUrl, options) {
    const routeMap = options === null || options === void 0 ? void 0 : options.routeMap;
    const basePathMap = options === null || options === void 0 ? void 0 : options.basePathMap;
    function mapPathname(pathname) {
        if (!basePathMap)
            return pathname;
        for (const k in basePathMap) {
            if (pathname.startsWith(k)) {
                return pathname.replace(k, basePathMap[k]);
            }
        }
        return pathname;
    }
    const checkStatus = (response) => {
        if (response.ok) {
            // response.status >= 200 && response.status < 300
            return response;
        }
        else {
            throw new HTTPResponseError(response);
        }
    };
    function getMethodAndUri(callPath, action, args) {
        var _a, _b, _c;
        if (routeMap) {
            const endpoint = (_c = (_b = (_a = callPath.reduce((resource, name) => { var _a; return (_a = resource === null || resource === void 0 ? void 0 : resource.namespacedResources) === null || _a === void 0 ? void 0 : _a[name]; }, routeMap)) === null || _a === void 0 ? void 0 : _a.actions) === null || _b === void 0 ? void 0 : _b[action]) === null || _c === void 0 ? void 0 : _c.endpoint;
            const match = endpoint ? /^([a-z]+)\s+(.+)/i.exec(endpoint) : null;
            if (match) {
                const method = match[1];
                const pathname = mapPathname(match[2]
                    .split("/")
                    .map((part) => part.startsWith("{") && part.endsWith("}")
                    ? encodeURIComponent(args.shift())
                    : part)
                    .join("/"));
                const fullUri = `${baseUrl}/${pathname}`;
                return { method: method, pathname, uri: fullUri };
            }
        }
        let path = callPath.join("/"); // eg; /issuing/cards
        if (typeof args[0] === "string" || typeof args[0] === "number") {
            path += `/${encodeURIComponent(args.shift())}`;
        }
        const method = actionMethod(action);
        const pathname = mapPathname(`${baseUrl}/${path}`);
        return {
            method,
            pathname,
            uri: pathname,
        };
    }
    const client = createRecursiveProxy((opts) => {
        const args = [...opts.args];
        const callPath = [...opts.path]; // e.g. ["issuing", "cards", "create"]
        const action = callPath.pop(); // TODO validate
        let requestOptions;
        let { method, pathname, uri } = getMethodAndUri(callPath, action, args);
        if (isRequestOptions(args.at(-1))) {
            requestOptions = args.pop();
        }
        const body = method === "GET" ? undefined : args[0];
        const query = Object.assign(Object.assign({}, (method === "GET" && typeof args[0] === "object" ? args[0] : null)), requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.query);
        let search = "";
        if (query && Object.keys(query).length) {
            search = `?${qs.stringify(query)}`;
            uri += search;
        }
        let cacheKey = uri;
        if (action === "list") {
            const { pageSize, sortDirection = "asc" } = query, restQuery = __rest(query, ["pageSize", "sortDirection"]);
            cacheKey = `${pathname}?${qs.stringify(Object.assign(Object.assign({}, restQuery), { sortDirection }))}`;
        }
        const doFetch = () => __awaiter(this, void 0, void 0, function* () {
            const res = yield ((options === null || options === void 0 ? void 0 : options.fetch) || fetch)(uri, {
                method,
                headers: Object.assign({ "Content-Type": "application/json" }, requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.headers),
                body: body ? JSON.stringify(body) : undefined, // TODO: don't include on GET
            });
            checkStatus(res);
            const responsebody = yield res.text();
            let json;
            try {
                json = JSON.parse(responsebody);
            }
            catch (e) {
                console.error("Could not parse json", responsebody);
            }
            if (json && "error" in json) {
                throw new Error(`Error: ${json.error.message}`);
            }
            const parsed = z.AnyPageData.safeParse(json);
            if (parsed.success) {
                return new PageImpl(client, opts.path, pathname, query, parsed.data);
            }
            return json;
        });
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
    }, []);
    return client;
}
// This is required so that we can determine if a given object matches the RequestOptions
// type at runtime. While this requires duplication, it is enforced by the TypeScript
// compiler such that any missing / extraneous keys will cause an error.
const requestOptionsKeys = {
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
const isRequestOptions = (obj) => {
    return (typeof obj === "object" &&
        obj !== null &&
        !isEmpty(obj) &&
        Object.keys(obj).every((k) => Object.hasOwn(requestOptionsKeys, k)));
};
export class PageImpl {
    constructor(client, clientPath, pathname, params, data) {
        this.client = client;
        this.clientPath = clientPath;
        this.pathname = pathname;
        this.params = params;
        this.data = data;
        Object.assign(this, data);
    }
    /**
     * Get params to access previous page.
     * @throws if there is no `startCursor`.
     */
    getPreviousPageParams() {
        const { startCursor } = this.data;
        if (startCursor == null) {
            throw new Error(`response doesn't have startCursor, can't get previous page`);
        }
        const _a = this.params, { pageSize, sortBy, sortDirection, 
        // eslint-disable-next-line no-unused-vars
        pageAfter: _pageAfter, 
        // eslint-disable-next-line no-unused-vars
        pageBefore: _pageBefore } = _a, rest = __rest(_a, ["pageSize", "sortBy", "sortDirection", "pageAfter", "pageBefore"]);
        return Object.assign(Object.assign({}, rest), { pageSize,
            sortBy,
            sortDirection, pageBefore: startCursor });
    }
    /** Gets the cursor to access the previous page. */
    getPreviousPageParam() {
        return this.data.startCursor;
    }
    /**
     * Gets the URL at which to access the previous page.
     * @throws if there is no `startCursor`.
     */
    getPreviousPageUrl() {
        return `${this.pathname}/${qs.stringify(this.getPreviousPageParams())}`;
    }
    /**
     * Gets the previous page.
     * @throws if there is no `startCursor`.
     */
    getPreviousPage() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientPath.reduce((client, path) => client[path], this.client)(this.getPreviousPageParams());
        });
    }
    /**
     * Get params to access the next page.
     * @throws if there is no `endCursor`.
     */
    getNextPageParams() {
        const { endCursor } = this.data;
        if (endCursor == null) {
            throw new Error(`response doesn't have endCursor, can't get next page`);
        }
        const _a = this.params, { pageSize, sortBy, sortDirection, 
        // eslint-disable-next-line no-unused-vars
        pageAfter: _pageAfter, 
        // eslint-disable-next-line no-unused-vars
        pageBefore: _pageBefore } = _a, rest = __rest(_a, ["pageSize", "sortBy", "sortDirection", "pageAfter", "pageBefore"]);
        return Object.assign(Object.assign({}, rest), { pageSize,
            sortBy,
            sortDirection, pageAfter: endCursor });
    }
    /** Gets the cursor to access the next page. */
    getNextPageParam() {
        return this.data.endCursor;
    }
    /**
     * Gets the URL at which to access the next page.
     * @throws if there is no `endCursor`.
     */
    getNextPageUrl() {
        return `${this.pathname}/${qs.stringify(this.getNextPageParams())}`;
    }
    /**
     * Gets the next page.
     * @throws if there is no `endCursor`.
     */
    getNextPage() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientPath.reduce((client, path) => client[path], this.client)(this.getNextPageParams());
        });
    }
}
/** A promise returned by {@link StainlessClient} requests. */
export class ClientPromise {
    constructor(fetch, props) {
        this.fetch = once(fetch);
        this.method = props.method;
        this.uri = props.uri;
        this.pathname = props.pathname;
        this.search = props.search;
        this.query = props.query;
    }
    then(onfulfilled, onrejected) {
        return this.fetch().then(onfulfilled, onrejected);
    }
    catch(onrejected) {
        return this.fetch().catch(onrejected);
    }
    finally(onfinally) {
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
export class PaginatorPromise extends ClientPromise {
    constructor(fetch, props) {
        super(fetch, props);
    }
    [Symbol.asyncIterator]() {
        return __asyncGenerator(this, arguments, function* _a() {
            let page = yield __await(this);
            while (page) {
                yield __await(yield* __asyncDelegator(__asyncValues(page.items)));
                page = page.hasNextPage ? yield __await(page.getNextPage()) : undefined;
            }
        });
    }
    get [Symbol.toStringTag]() {
        return "PaginatorPromise";
    }
}
//# sourceMappingURL=client.js.map