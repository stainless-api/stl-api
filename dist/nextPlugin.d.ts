import { AnyAPIDescription, AnyEndpoint, MakeStainlessPlugin } from "stainless";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
declare module "stainless" {
    interface StlContext<EC extends AnyEndpoint> {
        server: NextServerContext;
    }
}
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
type NextStatics = {
    pageRoute: <Endpoints extends AnyEndpoint[]>(...endpoint: Endpoints) => PagesHandler;
    catchAllRouter: <API extends AnyAPIDescription>(api: API, 
    /**
     * If options.catchAllParam is given, it will be excluded from params
     * passed to handlers
     */
    options?: RouterOptions) => PagesHandler;
    appRoute: (endpoint: AnyEndpoint, options?: RouterOptions) => AppHandler;
    appCatchAllRouter: <API extends AnyAPIDescription>(api: API, 
    /**
     * If options.catchAllParam is given, it will be excluded from params
     * passed to handlers
     */
    options?: RouterOptions) => AppHandlers;
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
export declare const makeNextPlugin: () => MakeStainlessPlugin<any, NextStatics>;
export {};
//# sourceMappingURL=nextPlugin.d.ts.map