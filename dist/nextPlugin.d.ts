import { AnyAPIDescription, AnyEndpoint, MakeStainlessPlugin } from "stainless";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
declare module "stainless" {
    interface StlContext<EC extends AnyBaseEndpoint> {
        server: NextServerContext;
    }
}
export declare const makeNextPlugin: () => MakeStainlessPlugin<any, {}>;
export type NextServerContext = {
    type: "nextjs";
    args: [NextApiRequest, NextApiResponse] | [NextRequest, {
        params: Record<string, any>;
    }];
};
type RouterOptions = {
    catchAllParam?: string;
    basePathMap?: Record<string, string>;
};
type PagesHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
type AppHandler = (req: NextRequest, ctx: {
    params: Record<string, any>;
}) => Promise<NextResponse>;
type AppHandlers = {
    GET: AppHandler;
    HEAD: AppHandler;
    POST: AppHandler;
    PUT: AppHandler;
    DELETE: AppHandler;
    PATCH: AppHandler;
    OPTIONS: AppHandler;
};
export declare const stlNextPageRoute: <Endpoints extends AnyEndpoint[]>(...endpoints: Endpoints) => PagesHandler;
export declare const stlNextPageCatchAllRouter: <API extends AnyAPIDescription>({ topLevel, resources }: API, options?: RouterOptions) => PagesHandler;
export declare const stlNextAppRoute: (endpoint: AnyEndpoint, options?: RouterOptions) => AppHandler;
export declare const stlNextAppCatchAllRouter: <API extends AnyAPIDescription>({ topLevel, resources }: API, options?: RouterOptions) => AppHandlers;
export {};
//# sourceMappingURL=nextPlugin.d.ts.map