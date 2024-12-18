import { Hono, HonoRequest } from "hono";
import { StatusCode } from "hono/utils/http-status";
import { AnyAPIDescription } from "stainless";
export type HonoServerContext = {
    type: "hono";
    args: [HonoRequest, Response];
};
declare module "stainless" {
    interface StlContext<EC extends AnyBaseEndpoint> {
        server: HonoServerContext;
    }
}
export declare function apiRoute({ topLevel, resources }: AnyAPIDescription): Hono<import("hono/types").BlankEnv, {
    "*": {
        $all: {
            input: {};
            output: {};
            outputFormat: "json";
            status: StatusCode;
        };
    };
}, "/">;
//# sourceMappingURL=honoPlugin.d.ts.map