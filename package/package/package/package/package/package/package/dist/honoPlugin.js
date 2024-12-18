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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoute = void 0;
const hono_1 = require("hono");
const qs_1 = __importDefault(require("qs"));
const stainless_1 = require("stainless");
const routeMatcher_1 = require("./routeMatcher");
const methods = ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
function makeApp(endpoints) {
    var _a;
    const stl = (_a = endpoints[0]) === null || _a === void 0 ? void 0 : _a.stl;
    if (!stl) {
        throw new Error(`endpoints[0].stl must be defined`);
    }
    const app = new hono_1.Hono();
    const routeMatcher = (0, routeMatcher_1.makeRouteMatcher)(endpoints);
    return app.all("*", (c) => __awaiter(this, void 0, void 0, function* () {
        try {
            const match = routeMatcher.match(c.req.method, c.req.path);
            const { search } = new URL(c.req.url);
            if (!(0, routeMatcher_1.isValidRouteMatch)(match)) {
                const enabledMethods = methods.filter((method) => (0, routeMatcher_1.isValidRouteMatch)(routeMatcher.match(method, c.req.path)));
                if (enabledMethods.length) {
                    return c.json({
                        message: `No handler for ${c.req.method}; only ${enabledMethods
                            .map((x) => x.toUpperCase())
                            .join(", ")}.`,
                    }, { status: 405 });
                }
                throw new stainless_1.NotFoundError();
            }
            const [endpoint, path] = match[0][0];
            const server = {
                type: "hono",
                args: [c.req, c.res],
            };
            const context = stl.initContext({
                endpoint,
                headers: c.req.header(),
                server,
            });
            const params = stl.initParams({
                path,
                query: search ? qs_1.default.parse(search.replace(/^\?/, "")) : {},
                body: yield c.req.json().catch(() => undefined),
                headers: c.req.header(),
            });
            const result = yield stl.execute(params, context);
            return c.json(result);
        }
        catch (error) {
            if ((0, stainless_1.isStlError)(error)) {
                return c.json(error.response, error.statusCode);
            }
            console.error(`ERROR in ${c.req.method} ${c.req.url}:`, error instanceof Error ? error.stack : error);
            return c.json({ error, details: "Failed to handle the request." }, 500);
        }
    }));
}
function apiRoute({ topLevel, resources }) {
    return makeApp((0, stainless_1.allEndpoints)({
        actions: topLevel === null || topLevel === void 0 ? void 0 : topLevel.actions,
        namespacedResources: resources,
    }));
}
exports.apiRoute = apiRoute;
//# sourceMappingURL=honoPlugin.js.map