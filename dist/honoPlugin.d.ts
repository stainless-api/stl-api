import { HonoRequest } from "hono";
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
export type StlAppOptions = {
    handleErrors?: boolean;
};
export declare function stlApi({ topLevel, resources }: AnyAPIDescription, options?: StlAppOptions): import("hono").MiddlewareHandler<any, string, {}>;
//# sourceMappingURL=honoPlugin.d.ts.map