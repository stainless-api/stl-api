import fetch, { Headers, Request, Response } from "node-fetch";
if (!globalThis.fetch) {
    // @ts-expect-error
    globalThis.fetch = fetch;
    // @ts-expect-error
    globalThis.Headers = Headers;
    // @ts-expect-error
    globalThis.Request = Request;
    // @ts-expect-error
    globalThis.Response = Response;
}
//# sourceMappingURL=fetch-polyfill.js.map