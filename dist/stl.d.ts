import * as z from "./z";
import { openapiSpec } from "./openapiSpec";
import type { OpenAPIObject } from "zod-openapi/lib-types/openapi3-ts/dist/oas31";
export { SelectTree, parseSelect } from "./parseSelect";
export { z };
export { createClient } from "./client";
export type { StainlessClient, ClientPromise, PaginatorPromise, Page, } from "./client";
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
export type HttpPath = `/${string}`;
export type HttpEndpoint = `${HttpMethod} ${HttpPath}`;
export declare function parseEndpoint(endpoint: HttpEndpoint): [HttpMethod, HttpPath];
/**
 * Ensures that the input and output types are both
 * objects; plays well with z.object(...).transform(() => ({...}))
 * whereas z.AnyZodObject doesn't.
 *
 * TODO: is there a z.Something for this already?
 */
export type ZodObjectSchema = z.ZodType<object, any, object>;
export type Handler<Ctx, Path extends ZodObjectSchema | undefined, Query extends ZodObjectSchema | undefined, Body extends ZodObjectSchema | undefined, Response> = (request: MakeRequest<Path, Query, Body>, ctx: Ctx) => Response | Promise<Response>;
type MakeRequest<Path extends ZodObjectSchema | undefined, Query extends ZodObjectSchema | undefined, Body extends ZodObjectSchema | undefined> = (Path extends z.ZodTypeAny ? z.infer<Path> : {}) & (Query extends z.ZodTypeAny ? z.infer<Query> : {}) & (Body extends z.ZodTypeAny ? z.infer<Body> : {});
export interface EndpointConfig {
}
export type Endpoint<UserContext extends object, Path extends ZodObjectSchema | undefined, Query extends ZodObjectSchema | undefined, Body extends ZodObjectSchema | undefined, Response extends z.ZodTypeAny | undefined> = {
    endpoint: HttpEndpoint;
    response: Response;
    config: EndpointConfig;
    path: Path;
    query: Query;
    body: Body;
    handler: Handler<UserContext & StlContext<Endpoint<UserContext, Path, Query, Body, Response>>, Path, Query, Body, Response extends z.ZodTypeAny ? z.input<Response> : undefined>;
};
export type AnyEndpoint = Endpoint<any, any, any, any, any>;
export declare function allEndpoints(resource: AnyResourceConfig | Pick<AnyResourceConfig, "actions" | "namespacedResources">): AnyEndpoint[];
type AnyActionsConfig = Record<string, AnyEndpoint | null>;
export type ResourceConfig<Actions extends AnyActionsConfig | undefined, NamespacedResources extends Record<string, ResourceConfig<any, any, any>> | undefined, Models extends Record<string, z.ZodTypeAny> | undefined> = {
    summary: string;
    internal?: boolean;
    actions: Actions;
    namespacedResources: NamespacedResources;
    models: Models;
};
export type AnyResourceConfig = ResourceConfig<any, any, any>;
export type APIDescription<TopLevel extends ResourceConfig<AnyActionsConfig, undefined, any>, Resources extends Record<string, AnyResourceConfig> | undefined> = {
    openapi: {
        endpoint: string | false;
        spec: OpenAPIObject;
    };
    topLevel: TopLevel;
    resources: Resources;
};
export type AnyAPIDescription = APIDescription<any, any>;
export declare class StlError extends Error {
    statusCode: number;
    response?: Record<string, any> | undefined;
    constructor(statusCode: number, response?: Record<string, any> | undefined);
}
export declare class BadRequestError extends StlError {
    constructor(response?: Record<string, any>);
}
export declare class UnauthorizedError extends StlError {
    constructor(response?: Record<string, any>);
}
export declare class ForbiddenError extends StlError {
    constructor(response?: Record<string, any>);
}
export declare class NotFoundError extends StlError {
    constructor(response?: Record<string, any>);
}
type AnyStatics = Record<string, any>;
export type StainlessPlugin<UserContext extends object, Statics extends AnyStatics | undefined = undefined> = {
    statics?: Statics;
    middleware?: <EC extends AnyEndpoint>(endpoint: EC, params: Params, context: PartialStlContext<UserContext, EC>) => void | Promise<void>;
};
export type MakeStainlessPlugin<UserContext extends object, Statics extends AnyStatics | undefined = undefined, Plugins extends AnyPlugins = {}> = (stl: Stl<UserContext, Plugins>) => StainlessPlugin<UserContext, Statics>;
type AnyPlugins = Record<string, MakeStainlessPlugin<any, any>>;
export type StainlessOpts<Plugins extends AnyPlugins> = {
    plugins: Plugins;
};
export type StainlessHeaders = Record<string, string | string[] | undefined>;
export interface BaseStlContext<EC extends AnyEndpoint> {
    endpoint: EC;
    headers: StainlessHeaders;
    parsedParams?: {
        path: any;
        query: any;
        body: any;
    };
    server: {
        type: string;
        args: unknown[];
    };
}
export interface StlContext<EC extends AnyEndpoint> extends BaseStlContext<EC> {
}
export type PartialStlContext<UserContext extends object, EC extends AnyEndpoint> = BaseStlContext<EC> & Partial<UserContext> & Partial<StlContext<EC>>;
export interface Params {
    path: any;
    query: any;
    body: any;
    headers: any;
}
export type ExtractStatics<Plugins extends AnyPlugins> = {
    [Name in keyof Plugins]: NonNullable<ReturnType<Plugins[Name]>["statics"]>;
};
type ExtractExecuteResponse<EC extends AnyEndpoint> = EC["response"] extends z.ZodTypeAny ? z.infer<EC["response"]> : undefined;
export declare const OpenAPIResponse: z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>;
export type OpenAPIResponse = z.infer<typeof OpenAPIResponse>;
export type OpenAPIEndpoint = Endpoint<any, undefined, undefined, undefined, typeof OpenAPIResponse>;
export type Stl<UserContext extends object, Plugins extends AnyPlugins> = {
    plugins: ExtractStatics<Plugins>;
    initContext: <EC extends AnyEndpoint>(c: PartialStlContext<UserContext, EC>) => PartialStlContext<UserContext, EC>;
    initParams: (p: Params) => Params;
    execute: <EC extends AnyEndpoint>(endpoint: EC, params: Params, context: PartialStlContext<UserContext, EC>) => Promise<ExtractExecuteResponse<EC>>;
    endpoint: <Path extends ZodObjectSchema | undefined, Query extends ZodObjectSchema | undefined, Body extends ZodObjectSchema | undefined, Response extends z.ZodTypeAny = z.ZodVoid>(options: {
        endpoint: HttpEndpoint;
        path?: Path;
        query?: Query;
        body?: Body;
        response?: Response;
        handler: Handler<UserContext & StlContext<Endpoint<UserContext, Path, Query, Body, Response>>, Path, Query, Body, Response extends z.ZodTypeAny ? z.input<Response> : undefined>;
    }) => Endpoint<UserContext, Path, Query, Body, Response>;
    resource: <Actions extends AnyActionsConfig | undefined, Resources extends Record<string, ResourceConfig<any, any, any>> | undefined, Models extends Record<string, z.ZodTypeAny> | undefined>(config: {
        summary: string;
        internal?: boolean;
        actions?: Actions;
        namespacedResources?: Resources;
        models?: Models;
    }) => ResourceConfig<Actions, Resources, Models>;
    api<TopLevel extends ResourceConfig<AnyActionsConfig, undefined, any>, Resources extends Record<string, AnyResourceConfig> | undefined>(config: {
        openapi: {
            endpoint: false;
        };
        topLevel?: TopLevel;
        resources?: Resources;
    }): APIDescription<TopLevel, Resources>;
    api<TopLevel extends ResourceConfig<AnyActionsConfig, undefined, any>, Resources extends Record<string, AnyResourceConfig> | undefined>(config: {
        openapi?: {
            endpoint?: HttpEndpoint;
        };
        topLevel?: TopLevel;
        resources?: Resources;
    }): APIDescription<TopLevel & {
        actions: {
            getOpenapi: OpenAPIEndpoint;
        };
    }, Resources>;
    openapiSpec: typeof openapiSpec;
    StlError: typeof StlError;
    BadRequestError: typeof BadRequestError;
    UnauthorizedError: typeof UnauthorizedError;
    ForbiddenError: typeof ForbiddenError;
    NotFoundError: typeof NotFoundError;
};
export declare function makeStl<UserContext extends object, Plugins extends AnyPlugins>(opts: StainlessOpts<Plugins>): Stl<UserContext, Plugins>;
//# sourceMappingURL=stl.d.ts.map