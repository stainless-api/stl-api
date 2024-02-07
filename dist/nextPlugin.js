"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stlNextAppCatchAllRouter = exports.stlNextAppRoute = exports.stlNextPageCatchAllRouter = exports.stlNextPageRoute = exports.makeNextPlugin = void 0;
const stainless_1 = require("stainless");
const qs_1 = __importDefault(require("qs"));
const trie_router_1 = require("hono/router/trie-router");
const endpointToHono_1 = require("./endpointToHono");
const server_1 = require("next/server");
const makeNextPlugin = () => () => ({
/* there used to be statics here, now they got moved to standalone functions.
  maybe we'll eventually put something back here...
 */
});
exports.makeNextPlugin = makeNextPlugin;
const methods = ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
const makeAppHandlers = (handler) => ({
    GET: handler,
    HEAD: handler,
    POST: handler,
    PUT: handler,
    DELETE: handler,
    PATCH: handler,
    OPTIONS: handler,
});
function makeRouter(endpoints, options) {
    var _a;
    const stl = (_a = endpoints[0]) === null || _a === void 0 ? void 0 : _a.stl;
    if (!stl) {
        throw new Error(`endpoints[0].stl must be defined`);
    }
    const routeMatcher = new trie_router_1.TrieRouter();
    for (const endpoint of endpoints) {
        let [method, path] = (0, endpointToHono_1.endpointToHono)(endpoint.endpoint);
        const basePathMap = options === null || options === void 0 ? void 0 : options.basePathMap;
        if (basePathMap) {
            // rewrite paths based on config…
            // TODO this is maybe not a feature we should keep.
            // (we just wanted it to serve routes from 2 places (Next and Hono) for testing purposes)
            for (const k in basePathMap) {
                if (path.startsWith(k)) {
                    path = path.replace(k, basePathMap[k]);
                    break;
                }
            }
        }
        routeMatcher.add(method, path, endpoint);
    }
    const catchAllParam = options === null || options === void 0 ? void 0 : options.catchAllParam;
    const appHandler = (req, ctx) => __awaiter(this, void 0, void 0, function* () {
        var _b, _c;
        try {
            const { method, url } = req;
            const { pathname, search } = new URL(url);
            const match = routeMatcher.match(method, pathname);
            if (!match) {
                const enabledMethods = methods.filter((method) => routeMatcher.match(method, pathname) != null);
                if (enabledMethods.length) {
                    return server_1.NextResponse.json({
                        message: `No handler for ${req.method}; only ${enabledMethods
                            .map((x) => x.toUpperCase())
                            .join(", ")}.`,
                    }, { status: 405 });
                }
                throw new stainless_1.NotFoundError();
            }
            const [endpoint, path] = match[0][0];
            const server = {
                type: "nextjs",
                args: [req, ctx],
            };
            const headers = {};
            req.headers.forEach((value, key) => (headers[key] = value));
            const context = stl.initContext({
                endpoint,
                // url: new URL(req.url!), // TODO make safe
                headers,
                server,
            });
            let query = search ? qs_1.default.parse(search.replace(/^\?/, "")) : {};
            if (catchAllParam) {
                // eslint-disable-next-line no-unused-vars
                let catchAll;
                (_b = query, _c = catchAllParam, catchAll = _b[_c], query = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]));
            }
            const bodyText = yield req.text();
            const params = stl.initParams({
                path,
                query,
                body: bodyText ? JSON.parse(bodyText) : undefined,
                headers: req.headers,
            });
            const result = yield stl.execute(params, context);
            return server_1.NextResponse.json(result);
        }
        catch (error) {
            if ((0, stainless_1.isStlError)(error)) {
                return server_1.NextResponse.json(error.response, {
                    status: error.statusCode,
                });
            }
            console.error(`ERROR in ${req.method} ${req.url}:`, error instanceof Error ? error.stack : error);
            return server_1.NextResponse.json({ error, details: "Failed to handle the request." }, { status: 500 });
        }
    });
    const pagesHandler = (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _d, _e;
        const resp = null;
        try {
            const { method, url } = req;
            if (!method)
                throw new Error(`missing req.method`);
            if (!url)
                throw new Error(`missing req.url`);
            if (!url.startsWith("/"))
                throw new Error(`expected url to start with /, but got ${url}`);
            const { pathname } = new URL(`http://localhost${url}`);
            const match = routeMatcher.match(method, pathname);
            if (!match) {
                const enabledMethods = methods.filter((method) => routeMatcher.match(method, pathname) != null);
                if (enabledMethods.length) {
                    res.status(405).json({
                        message: `No handler for ${req.method}; only ${enabledMethods
                            .map((x) => x)
                            .join(", ")}.`,
                    });
                    return;
                }
                throw new stainless_1.NotFoundError();
            }
            const [endpoint, path] = match[0][0];
            const server = {
                type: "nextjs",
                args: [req, res],
            };
            const context = stl.initContext({
                endpoint,
                // url: new URL(req.url!), // TODO make safe
                headers: req.headers,
                server,
            });
            let query = req.query;
            if (catchAllParam) {
                // eslint-disable-next-line no-unused-vars
                let catchAll;
                (_d = req.query, _e = catchAllParam, catchAll = _d[_e], query = __rest(_d, [typeof _e === "symbol" ? _e : _e + ""]));
            }
            const params = stl.initParams({
                path,
                query: qs_1.default.parse(query),
                body: req.body,
                headers: req.headers,
            });
            const result = yield stl.execute(params, context);
            res.status(200).send(result);
        }
        catch (error) {
            if ((0, stainless_1.isStlError)(error)) {
                res.status(error.statusCode).json(error.response);
                return;
            }
            console.error(`ERROR in ${req.method} ${req.url}:`, error instanceof Error ? error.stack : error);
            res.status(500).json({ error, details: "Failed to handle the request." });
            return;
        }
    });
    return { appHandler, pagesHandler };
}
const stlNextPageRoute = (...endpoints) => makeRouter(endpoints).pagesHandler;
exports.stlNextPageRoute = stlNextPageRoute;
const stlNextPageCatchAllRouter = ({ topLevel, resources }, options) => makeRouter((0, stainless_1.allEndpoints)({
    actions: topLevel === null || topLevel === void 0 ? void 0 : topLevel.actions,
    namespacedResources: resources,
}), options).pagesHandler;
exports.stlNextPageCatchAllRouter = stlNextPageCatchAllRouter;
const stlNextAppRoute = (endpoint, options) => makeRouter([endpoint], options).appHandler;
exports.stlNextAppRoute = stlNextAppRoute;
const stlNextAppCatchAllRouter = ({ topLevel, resources }, options) => makeAppHandlers(makeRouter((0, stainless_1.allEndpoints)({
    actions: topLevel === null || topLevel === void 0 ? void 0 : topLevel.actions,
    namespacedResources: resources,
}), options).appHandler);
exports.stlNextAppCatchAllRouter = stlNextAppCatchAllRouter;
//# sourceMappingURL=nextPlugin.js.map