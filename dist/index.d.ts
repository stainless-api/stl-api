import { type Request, type Application, type Router, type Response, type RequestHandler, type ErrorRequestHandler, RouterOptions } from "express";
import { AnyAPIDescription, AnyActionsConfig, EndpointResponseOutput } from "stainless";
import { type AnyEndpoint } from "stainless";
export type ExpressServerContext = {
    type: "express";
    args: [Request, Response];
};
export type CreateExpressHandlerOptions = {
    /**
     * If false, errors will be passed to the `next` middleware;
     * otherwise the created express handler will send the appropriate
     * response if an error is caught.
     */
    handleErrors?: boolean;
};
type BasePathMap = Record<string, string>;
export type AddToExpressOptions = CreateExpressHandlerOptions & {
    /**
     * Mappings to apply to Stainless API Endpoint paths.  For example
     * with `basePathMap: { '/api/', '/api/v2/' }, the endpoint
     * `get /api/posts` would get transformed to `get /api/v2/posts`
     */
    basePathMap?: BasePathMap;
};
/**
 * Executes the given Express request on the given Stainless API Endpoint, returning
 * the result from the endpoint handler without sending it in a response.
 *
 * @param endpoint the endpoint to execute the request on
 * @param req the Express request
 * @param res the Express response
 * @returns a Promise that resolves to the return value of the endpoint handler,
 * or rejects if it throws an error
 */
export declare function stlExecuteExpressRequest<EC extends AnyEndpoint>(endpoint: AnyEndpoint, req: Request, res: Response): Promise<EndpointResponseOutput<EC>>;
/**
 * Creates an express route handler function for the given stainless endpoint.
 */
export declare function stlExpressRouteHandler(endpoint: AnyEndpoint, options: CreateExpressHandlerOptions): RequestHandler;
export declare const methodNotAllowedHandler: RequestHandler;
/**
 * The default Express error handler middleware for errors thrown from
 * Stainless endpoints
 */
export declare const stlExpressErrorHandler: ErrorRequestHandler;
/**
 * Registers a Stainless endpoint with the given Express Application or Router.
 */
export declare function addStlEndpointToExpress(router: Application | Router, endpoint: AnyEndpoint, options?: AddToExpressOptions): void;
type AnyResourceConfig = {
    actions: AnyActionsConfig | undefined;
    namespacedResources: Record<string, AnyResourceConfig> | undefined;
};
type AddEndpointsToExpressOptions = AddToExpressOptions & {
    /**
     * Whether to add 405 method not allowed handlers to the Express
     * Router or Application (defaults to true)
     */
    addMethodNotAllowedHandlers?: boolean;
};
/**
 * Registers all endpoints in a Stainless resource with the given Express Application or Router.
 */
export declare function addStlResourceToExpress(router: Application | Router, resource: Pick<AnyResourceConfig, "actions" | "namespacedResources">, options?: AddEndpointsToExpressOptions): void;
/**
 * Creates an Express Router for the given Stainless resource
 */
export declare function stlExpressResourceRouter(resource: Pick<AnyResourceConfig, "actions" | "namespacedResources">, options?: AddEndpointsToExpressOptions & RouterOptions): Router;
/**
 * Registers all endpoints in a Stainless API with the given Express Application or Router.
 */
export declare function addStlAPIToExpress(router: Application | Router, api: AnyAPIDescription, options?: AddEndpointsToExpressOptions): void;
/**
 * Creates an Express Router for the given Stainless API
 */
export declare function stlExpressAPIRouter(api: AnyAPIDescription, options?: AddEndpointsToExpressOptions): Router;
export declare function stlExpressAPI(api: AnyAPIDescription, options?: AddEndpointsToExpressOptions): Application;
export {};
//# sourceMappingURL=index.d.ts.map