"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const stainless_1 = require("stainless");
const __1 = require("..");
const react_query_1 = require("@tanstack/react-query");
const react_1 = require("@testing-library/react");
const stl = new stainless_1.Stl({ plugins: {} });
const api = stl.api({
    basePath: "/",
    resources: {
        query: stl.resource({
            summary: "query",
            actions: {
                update: stl.endpoint({
                    endpoint: "POST /query/{foo}",
                    query: stainless_1.z.object({ bar: stainless_1.z.string() }),
                    response: stainless_1.z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
        optionalQuery: stl.resource({
            summary: "optionalQuery",
            actions: {
                update: stl.endpoint({
                    endpoint: "POST /optionalQuery/{foo}",
                    query: stainless_1.z.object({ bar: stainless_1.z.string().optional() }),
                    response: stainless_1.z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
        pathQuery: stl.resource({
            summary: "pathQuery",
            actions: {
                update: stl.endpoint({
                    endpoint: "POST /pathQuery/{foo}",
                    path: stainless_1.z.object({ foo: stainless_1.z.string() }),
                    query: stainless_1.z.object({ bar: stainless_1.z.string() }),
                    response: stainless_1.z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
        pathOptionalQuery: stl.resource({
            summary: "pathOptionalQuery",
            actions: {
                update: stl.endpoint({
                    endpoint: "POST /pathOptionalQuery/{foo}",
                    path: stainless_1.z.object({ foo: stainless_1.z.string() }),
                    query: stainless_1.z.object({ bar: stainless_1.z.string().optional() }),
                    response: stainless_1.z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
        body: stl.resource({
            summary: "body",
            actions: {
                update: stl.endpoint({
                    endpoint: "POST /body",
                    body: stainless_1.z.object({ bar: stainless_1.z.string() }),
                    response: stainless_1.z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
        pathBody: stl.resource({
            summary: "pathBody",
            actions: {
                update: stl.endpoint({
                    endpoint: "POST /pathBody/{foo}",
                    path: stainless_1.z.object({ foo: stainless_1.z.string() }),
                    body: stainless_1.z.object({ bar: stainless_1.z.string() }),
                    response: stainless_1.z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
        queryBody: stl.resource({
            summary: "queryBody",
            actions: {
                update: stl.endpoint({
                    endpoint: "POST /queryBody",
                    query: stainless_1.z.object({ foo: stainless_1.z.string() }),
                    body: stainless_1.z.object({ bar: stainless_1.z.string() }),
                    response: stainless_1.z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
        pathQueryBody: stl.resource({
            summary: "pathQueryBody",
            actions: {
                update: stl.endpoint({
                    endpoint: "POST /pathQueryBody/{foo}",
                    path: stainless_1.z.object({ foo: stainless_1.z.string() }),
                    query: stainless_1.z.object({ baz: stainless_1.z.string() }),
                    body: stainless_1.z.object({ bar: stainless_1.z.string() }),
                    response: stainless_1.z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
        optionalQueryBody: stl.resource({
            summary: "optionalQueryBody",
            actions: {
                update: stl.endpoint({
                    endpoint: "POST /optionalQueryBody",
                    query: stainless_1.z.object({ foo: stainless_1.z.string().optional() }),
                    body: stainless_1.z.object({ bar: stainless_1.z.string() }),
                    response: stainless_1.z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
        pathOptionalQueryBody: stl.resource({
            summary: "pathOptionalQueryBody",
            actions: {
                update: stl.endpoint({
                    endpoint: "POST /pathOptionalQueryBody/{foo}",
                    path: stainless_1.z.object({ foo: stainless_1.z.string() }),
                    query: stainless_1.z.object({ baz: stainless_1.z.string().optional() }),
                    body: stainless_1.z.object({ bar: stainless_1.z.string() }),
                    response: stainless_1.z.any(),
                    handler() {
                        return __awaiter(this, void 0, void 0, function* () { });
                    },
                }),
            },
        }),
    },
});
// fetch mock that just echoes back its arguments
const fetch = (req, init) => __awaiter(void 0, void 0, void 0, function* () {
    return new Response(JSON.stringify({
        req,
        body: typeof (init === null || init === void 0 ? void 0 : init.body) === "string" ? JSON.parse(init.body) : undefined,
    }));
});
const queryClient = new react_query_1.QueryClient();
const baseUrl = "http://localhost:3000";
const useClient = (0, __1.createUseReactQueryClient)(baseUrl, {
    fetch,
});
function testCase(description, useMutation, doMutation, expectedUrl, expectedBody) {
    it(description, () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        let hookResult;
        const Comp = () => {
            const result = useMutation(useClient());
            hookResult = result;
            React.useEffect(() => {
                doMutation(result.mutate);
            }, []);
            return null;
        };
        (0, react_1.render)(React.createElement(react_query_1.QueryClientProvider, { client: queryClient },
            React.createElement(Comp, null)));
        yield (0, react_1.waitFor)(() => expect(hookResult === null || hookResult === void 0 ? void 0 : hookResult.isSuccess).toEqual(true), {
            interval: 500,
            timeout: 10000,
        });
        expect((_a = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _a === void 0 ? void 0 : _a.req).toEqual(`${baseUrl}${expectedUrl}`);
        if (expectedBody) {
            expect((_b = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _b === void 0 ? void 0 : _b.body).toEqual(expectedBody);
        }
    }), 15000);
}
describe("useMutation", () => {
    testCase("post with required query", (client) => client.query.useUpdate(), (update) => update({ query: { bar: "b" } }), "/query?bar=b");
    testCase("post with omitted optional query", (client) => client.optionalQuery.useUpdate(), (update) => update(), "/optionalQuery");
    testCase("post with optional query", (client) => client.optionalQuery.useUpdate(), (update) => update({ query: { bar: "b" } }), "/optionalQuery?bar=b");
    testCase("post with path and required query", (client) => client.pathQuery.useUpdate(), (update) => update("a", { query: { bar: "b" } }), "/pathQuery/a?bar=b");
    testCase("post with path and optional query", (client) => client.pathOptionalQuery.useUpdate(), (update) => update("a", { query: { bar: "b" } }), "/pathOptionalQuery/a?bar=b");
    testCase("post with path and omitted optional query", (client) => client.pathOptionalQuery.useUpdate(), (update) => update("a"), "/pathOptionalQuery/a");
    testCase("post with body", (client) => client.body.useUpdate(), (update) => update({ bar: "a" }), "/body", { bar: "a" });
    testCase("post with path and body", (client) => client.pathBody.useUpdate(), (update) => update("a", { bar: "b" }), "/pathBody/a", { bar: "b" });
    testCase("post with query and body", (client) => client.queryBody.useUpdate(), (update) => update({ bar: "b" }, { query: { foo: "a" } }), "/queryBody?foo=a", { bar: "b" });
    testCase("post with path, query and body", (client) => client.pathQueryBody.useUpdate(), (update) => update("x", { bar: "b" }, { query: { baz: "a" } }), "/pathQueryBody/x?baz=a", { bar: "b" });
    testCase("post with optional query and body", (client) => client.optionalQueryBody.useUpdate(), (update) => update({ bar: "b" }, { query: { foo: "a" } }), "/optionalQueryBody?foo=a", { bar: "b" });
    testCase("post with omitted optional query and body", (client) => client.optionalQueryBody.useUpdate(), (update) => update({ bar: "b" }), "/optionalQueryBody", { bar: "b" });
    testCase("post with path, optional query and body", (client) => client.pathOptionalQueryBody.useUpdate(), (update) => update("x", { bar: "b" }, { query: { baz: "a" } }), "/pathOptionalQueryBody/x?baz=a", { bar: "b" });
    testCase("post with path, omitted optional query and body", (client) => client.pathOptionalQueryBody.useUpdate(), (update) => update("x", { bar: "b" }), "/pathOptionalQueryBody/x", { bar: "b" });
});
it("post with query - onSuccess hook passed to useMutation", () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const endpoint = api.resources.query.actions.update;
    let onSuccessArgs;
    let hookResult;
    const Comp = () => {
        const result = useClient().query.useUpdate({
            onSuccess: (...args) => (onSuccessArgs = args),
        });
        hookResult = result;
        React.useEffect(() => {
            result.mutate({ query: { bar: "a" } });
        }, []);
        return null;
    };
    (0, react_1.render)(React.createElement(react_query_1.QueryClientProvider, { client: queryClient },
        React.createElement(Comp, null)));
    yield (0, react_1.waitFor)(() => {
        expect(hookResult === null || hookResult === void 0 ? void 0 : hookResult.isSuccess).toEqual(true);
        expect(onSuccessArgs).toBeDefined();
    }, {
        interval: 500,
        timeout: 10000,
    });
    expect((_a = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _a === void 0 ? void 0 : _a.req).toMatchInlineSnapshot(`"http://localhost:3000/query?bar=a"`);
    expect((_b = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _b === void 0 ? void 0 : _b.body).toMatchInlineSnapshot(`undefined`);
    expect(onSuccessArgs).toMatchInlineSnapshot(`
    [
      {
        "req": "http://localhost:3000/query?bar=a",
      },
      {
        "args": [
          {
            "query": {
              "bar": "a",
            },
          },
        ],
      },
      undefined,
    ]
  `);
}), 15000);
it("post with query - onSuccess hook passed to mutate fn", () => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const endpoint = api.resources.query.actions.update;
    let onSuccessArgs;
    let hookResult;
    const Comp = () => {
        const result = useClient().query.useUpdate();
        hookResult = result;
        React.useEffect(() => {
            result.mutate({
                query: { bar: "a" },
                onSuccess: (...args) => (onSuccessArgs = args),
            });
        }, []);
        return null;
    };
    (0, react_1.render)(React.createElement(react_query_1.QueryClientProvider, { client: queryClient },
        React.createElement(Comp, null)));
    yield (0, react_1.waitFor)(() => {
        expect(hookResult === null || hookResult === void 0 ? void 0 : hookResult.isSuccess).toEqual(true);
        expect(onSuccessArgs).toBeDefined();
    }, {
        interval: 500,
        timeout: 10000,
    });
    expect((_c = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _c === void 0 ? void 0 : _c.req).toMatchInlineSnapshot(`"http://localhost:3000/query?bar=a"`);
    expect((_d = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _d === void 0 ? void 0 : _d.body).toMatchInlineSnapshot(`undefined`);
    expect(onSuccessArgs).toMatchInlineSnapshot(`
    [
      {
        "req": "http://localhost:3000/query?bar=a",
      },
      {
        "args": [
          {
            "query": {
              "bar": "a",
            },
          },
        ],
      },
      undefined,
    ]
  `);
}), 15000);
it("post with path, optional query and body - onSuccess hook passed to useMutation", () => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const endpoint = api.resources.pathOptionalQueryBody.actions.update;
    let onSuccessArgs;
    let hookResult;
    const Comp = () => {
        const result = useClient().pathOptionalQueryBody.useUpdate({
            onSuccess: (...args) => (onSuccessArgs = args),
        });
        hookResult = result;
        React.useEffect(() => {
            result.mutate("a", { bar: "b" });
        }, []);
        return null;
    };
    (0, react_1.render)(React.createElement(react_query_1.QueryClientProvider, { client: queryClient },
        React.createElement(Comp, null)));
    yield (0, react_1.waitFor)(() => {
        expect(hookResult === null || hookResult === void 0 ? void 0 : hookResult.isSuccess).toEqual(true);
        expect(onSuccessArgs).toBeDefined();
    }, {
        interval: 500,
        timeout: 10000,
    });
    expect((_e = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _e === void 0 ? void 0 : _e.req).toMatchInlineSnapshot(`"http://localhost:3000/pathOptionalQueryBody/a"`);
    expect((_f = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _f === void 0 ? void 0 : _f.body).toMatchInlineSnapshot(`
    {
      "bar": "b",
    }
  `);
    expect(onSuccessArgs).toMatchInlineSnapshot(`
    [
      {
        "body": {
          "bar": "b",
        },
        "req": "http://localhost:3000/pathOptionalQueryBody/a",
      },
      {
        "args": [
          "a",
          {
            "bar": "b",
          },
        ],
      },
      undefined,
    ]
  `);
}), 15000);
it("post with path, optional query and body - onSuccess hook passed to mutate fn", () => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    const endpoint = api.resources.pathOptionalQueryBody.actions.update;
    let onSuccessArgs;
    let hookResult;
    const Comp = () => {
        const result = useClient().pathOptionalQueryBody.useUpdate();
        hookResult = result;
        React.useEffect(() => {
            result.mutate("a", { bar: "b" }, {
                onSuccess: (...args) => (onSuccessArgs = args),
            });
        }, []);
        return null;
    };
    (0, react_1.render)(React.createElement(react_query_1.QueryClientProvider, { client: queryClient },
        React.createElement(Comp, null)));
    yield (0, react_1.waitFor)(() => {
        expect(hookResult === null || hookResult === void 0 ? void 0 : hookResult.isSuccess).toEqual(true);
        expect(onSuccessArgs).toBeDefined();
    }, {
        interval: 500,
        timeout: 10000,
    });
    expect((_g = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _g === void 0 ? void 0 : _g.req).toMatchInlineSnapshot(`"http://localhost:3000/pathOptionalQueryBody/a"`);
    expect((_h = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _h === void 0 ? void 0 : _h.body).toMatchInlineSnapshot(`
    {
      "bar": "b",
    }
  `);
    expect(onSuccessArgs).toMatchInlineSnapshot(`
    [
      {
        "body": {
          "bar": "b",
        },
        "req": "http://localhost:3000/pathOptionalQueryBody/a",
      },
      {
        "args": [
          "a",
          {
            "bar": "b",
          },
        ],
      },
      undefined,
    ]
  `);
}), 15000);
it("post with path, query and body - onSuccess hook passed to useMutation", () => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k;
    const endpoint = api.resources.pathQueryBody.actions.update;
    let onSuccessArgs;
    let hookResult;
    const Comp = () => {
        const result = useClient().pathQueryBody.useUpdate({
            onSuccess: (...args) => (onSuccessArgs = args),
        });
        hookResult = result;
        React.useEffect(() => {
            result.mutate("a", { bar: "b" }, { query: { baz: "c" } });
        }, []);
        return null;
    };
    (0, react_1.render)(React.createElement(react_query_1.QueryClientProvider, { client: queryClient },
        React.createElement(Comp, null)));
    yield (0, react_1.waitFor)(() => {
        expect(hookResult === null || hookResult === void 0 ? void 0 : hookResult.isSuccess).toEqual(true);
        expect(onSuccessArgs).toBeDefined();
    }, {
        interval: 500,
        timeout: 10000,
    });
    expect((_j = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _j === void 0 ? void 0 : _j.req).toMatchInlineSnapshot(`"http://localhost:3000/pathQueryBody/a?baz=c"`);
    expect((_k = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _k === void 0 ? void 0 : _k.body).toMatchInlineSnapshot(`
    {
      "bar": "b",
    }
  `);
    expect(onSuccessArgs).toMatchInlineSnapshot(`
    [
      {
        "body": {
          "bar": "b",
        },
        "req": "http://localhost:3000/pathQueryBody/a?baz=c",
      },
      {
        "args": [
          "a",
          {
            "bar": "b",
          },
          {
            "query": {
              "baz": "c",
            },
          },
        ],
      },
      undefined,
    ]
  `);
}), 15000);
it("post with path, query and body - onSuccess hook passed to mutate fn", () => __awaiter(void 0, void 0, void 0, function* () {
    var _l, _m;
    const endpoint = api.resources.pathQueryBody.actions.update;
    let onSuccessArgs;
    let hookResult;
    const Comp = () => {
        const result = useClient().pathQueryBody.useUpdate();
        hookResult = result;
        React.useEffect(() => {
            result.mutate("a", { bar: "b" }, {
                query: { baz: "c" },
                onSuccess: (...args) => (onSuccessArgs = args),
            });
        }, []);
        return null;
    };
    (0, react_1.render)(React.createElement(react_query_1.QueryClientProvider, { client: queryClient },
        React.createElement(Comp, null)));
    yield (0, react_1.waitFor)(() => {
        expect(hookResult === null || hookResult === void 0 ? void 0 : hookResult.isSuccess).toEqual(true);
        expect(onSuccessArgs).toBeDefined();
    }, {
        interval: 500,
        timeout: 10000,
    });
    expect((_l = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _l === void 0 ? void 0 : _l.req).toMatchInlineSnapshot(`"http://localhost:3000/pathQueryBody/a?baz=c"`);
    expect((_m = hookResult === null || hookResult === void 0 ? void 0 : hookResult.data) === null || _m === void 0 ? void 0 : _m.body).toMatchInlineSnapshot(`
    {
      "bar": "b",
    }
  `);
    expect(onSuccessArgs).toMatchInlineSnapshot(`
    [
      {
        "body": {
          "bar": "b",
        },
        "req": "http://localhost:3000/pathQueryBody/a?baz=c",
      },
      {
        "args": [
          "a",
          {
            "bar": "b",
          },
          {
            "query": {
              "baz": "c",
            },
          },
        ],
      },
      undefined,
    ]
  `);
}), 15000);
function typeTests() {
    const client = useClient();
    // @ts-expect-error
    client.query.useUpdate().mutate();
    // @ts-expect-error
    client.query.useUpdate().mutate("a");
    // @ts-expect-error
    client.query.useUpdate().mutate({});
    // @ts-expect-error
    client.query.useUpdate().mutate({ query: {} });
    // @ts-expect-error
    client.query.useUpdate().mutate({ query: { bar: 1 } });
    client.query.useUpdate().mutate({ query: { bar: "a" }, onError: () => { } });
    // @ts-expect-error
    client.optionalQuery.useUpdate().mutate("a");
    // @ts-expect-error
    client.optionalQuery.useUpdate().mutate({ query: 1 });
    // @ts-expect-error
    client.optionalQuery.useUpdate().mutate({ query: { bar: 1 } });
    client.optionalQuery.useUpdate().mutate();
    client.optionalQuery.useUpdate().mutate({ query: {} });
    client.optionalQuery
        .useUpdate()
        .mutate({ query: { bar: "a" }, onError: () => { } });
    // @ts-expect-error
    client.pathQuery.useUpdate().mutate();
    // @ts-expect-error
    client.pathQuery.useUpdate().mutate("a");
    // @ts-expect-error
    client.pathQuery.useUpdate().mutate({ query: { bar: "b" } });
    // @ts-expect-error
    client.pathQuery.useUpdate().mutate(1, { query: { bar: "b" } });
    // @ts-expect-error
    client.pathQuery.useUpdate().mutate("a", {});
    // @ts-expect-error
    client.pathQuery.useUpdate().mutate("a", { query: {} });
    // @ts-expect-error
    client.pathQuery.useUpdate().mutate("a", { query: { bar: 1 } });
    client.pathQuery
        .useUpdate()
        .mutate("a", { query: { bar: "b" }, onError: () => { } });
    // @ts-expect-error
    client.pathOptionalQuery.useUpdate().mutate();
    // @ts-expect-error
    client.pathOptionalQuery.useUpdate().mutate(1);
    // @ts-expect-error
    client.pathOptionalQuery.useUpdate().mutate("a", { query: 1 });
    // @ts-expect-error
    client.pathOptionalQuery.useUpdate().mutate("a", { query: { bar: 1 } });
    // @ts-expect-error
    client.pathOptionalQuery.useUpdate().mutate(1, { query: { bar: "a" } });
    client.pathOptionalQuery.useUpdate().mutate("a");
    client.pathOptionalQuery.useUpdate().mutate("a", {});
    client.pathOptionalQuery.useUpdate().mutate("a", { query: {} });
    client.pathOptionalQuery
        .useUpdate()
        .mutate("a", { query: { bar: "b" }, onError: () => { } });
    // @ts-expect-error
    client.body.useUpdate().mutate();
    // @ts-expect-error
    client.body.useUpdate().mutate("a");
    // @ts-expect-error
    client.body.useUpdate().mutate({});
    // @ts-expect-error
    client.body.useUpdate().mutate({ bar: 1 });
    client.body.useUpdate().mutate({ bar: "a" });
    client.body.useUpdate().mutate({ bar: "a" }, { onError: () => { } });
    // @ts-expect-error
    client.pathBody.useUpdate().mutate();
    // @ts-expect-error
    client.pathBody.useUpdate().mutate("a");
    // @ts-expect-error
    client.pathBody.useUpdate().mutate("a", {});
    // @ts-expect-error
    client.pathBody.useUpdate().mutate("a", { bar: 1 });
    // @ts-expect-error
    client.pathBody.useUpdate().mutate(1, { bar: "a" });
    client.pathBody.useUpdate().mutate("a", { bar: "a" });
    client.pathBody.useUpdate().mutate("a", { bar: "a" }, { onError: () => { } });
    // @ts-expect-error
    client.queryBody.useUpdate().mutate();
    // @ts-expect-error
    client.queryBody.useUpdate().mutate(1);
    // @ts-expect-error
    client.queryBody.useUpdate().mutate({ bar: "a" });
    // @ts-expect-error
    client.queryBody.useUpdate().mutate(1, { query: { foo: "a" } });
    // @ts-expect-error
    client.queryBody.useUpdate().mutate("a", { query: { foo: "a" } });
    // @ts-expect-error
    client.queryBody.useUpdate().mutate({ bar: "a" }, {});
    // @ts-expect-error
    client.queryBody.useUpdate().mutate({ bar: "a" }, { query: {} });
    // @ts-expect-error
    client.queryBody.useUpdate().mutate({ bar: "a" }, { query: "a" });
    // @ts-expect-error
    client.queryBody.useUpdate().mutate({ bar: "a" }, { query: { foo: 1 } });
    client.queryBody
        .useUpdate()
        .mutate({ bar: "a" }, { query: { foo: "a" }, onError: () => { } });
    // @ts-expect-error
    client.optionalQueryBody.useUpdate().mutate();
    // @ts-expect-error
    client.optionalQueryBody.useUpdate().mutate(1);
    // @ts-expect-error
    client.optionalQueryBody.useUpdate().mutate({});
    // @ts-expect-error
    client.optionalQueryBody.useUpdate().mutate({ bar: 1 });
    client.optionalQueryBody
        .useUpdate()
        // @ts-expect-error
        .mutate({ bar: "a" }, { query: { bar: 1 } });
    client.optionalQueryBody.useUpdate().mutate({ bar: "a" });
    client.optionalQueryBody.useUpdate().mutate({ bar: "a" }, {});
    client.optionalQueryBody.useUpdate().mutate({ bar: "a" }, { query: {} });
    client.optionalQueryBody
        .useUpdate()
        .mutate({ bar: "a" }, { query: { foo: "b" }, onError: () => { } });
    // @ts-expect-error
    client.pathOptionalQueryBody.useUpdate().mutate();
    // @ts-expect-error
    client.pathOptionalQueryBody.useUpdate().mutate(1);
    // @ts-expect-error
    client.pathOptionalQueryBody.useUpdate().mutate("x");
    // @ts-expect-error
    client.pathOptionalQueryBody.useUpdate().mutate("x", 1);
    // @ts-expect-error
    client.pathOptionalQueryBody.useUpdate().mutate("x", {});
    // @ts-expect-error
    client.pathOptionalQueryBody.useUpdate().mutate("x", { bar: 1 });
    client.pathOptionalQueryBody
        .useUpdate()
        // @ts-expect-error
        .mutate("x", { bar: "a" }, { query: { baz: 1 } });
    // @ts-expect-error
    client.pathOptionalQueryBody.useUpdate().mutate({ blah: 1 }, { bar: "a" });
    // @ts-expect-error
    client.pathOptionalQueryBody.useUpdate().mutate(1, { bar: "a" });
    client.pathOptionalQueryBody.useUpdate().mutate("x", { bar: "a" });
    client.pathOptionalQueryBody.useUpdate().mutate("x", { bar: "a" }, {});
    client.pathOptionalQueryBody
        .useUpdate()
        .mutate("x", { bar: "a" }, { query: {} });
    client.pathOptionalQueryBody
        .useUpdate()
        .mutate("x", { bar: "a" }, { query: { baz: "b" }, onError: () => { } });
}
//# sourceMappingURL=useMutation.test.js.map