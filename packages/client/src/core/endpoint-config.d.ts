import { Endpoint, Stl, ZodObjectSchema } from "stainless";
import { FilterPathParts, SplitPathIntoParts } from "./endpoint-string";

interface EndpointConfig {
  endpoint: Endpoint;
  path?: ZodObjectSchema;
  config?: any; // TODO
  query?: any; // TODO
  body?: any; // TODO
  handler?: () => any; // TODO
}

// endpoint<
// MethodAndUrl extends HttpEndpoint,
// Config extends EndpointConfig | undefined,
// Path extends ZodObjectSchema | undefined,
// Query extends ZodObjectSchema | undefined,
// Body extends ZodObjectSchema | undefined,
// Response extends z.ZodTypeAny = z.ZodVoid
// >(
// params: CreateEndpointOptions<
//   MethodAndUrl,
//   Config,
//   Path,
//   Query,
//   Body,
//   Response
// >
// ): Endpoint<Config, MethodAndUrl, Path, Query, Body, Response> {

// function endpoint(config: EndpointConfig) {}

// const stl = new Stl({ plugins: {}});
// stl.endpoint({})

export type CallableEndpoint<
  E extends Endpoint,
  BasePath extends string = ""
> = FilterPathParts<SplitPathIntoParts<E["endpoint"]>, BasePath>;

export type CallablePath<P extends readonly PathPart[]> = {};

// export type MakeCallable<P extends PathPart[]> = P extends [infer H, ...infer R]
//   ? R extends PathPart[]
//     ? H extends PathPart
//       ? ?{
//           [key in H["name"]]: H extends ResourcePart<string>
//             ? MakeCallable<R>
//             : () => MakeCallable<R>;
//         }
//       : never
//     : never
//   : "Call API";

interface BaseParamPart<T extends string> {
  type: "param";
  name: T;
}

interface BaseResourcePart<T extends string> {
  type: "resource";
  name: T;
}

type BasePathPart = BaseParamPart<string> | BaseResourcePart<string>;

type EndpointPathParam<
  PathParam extends BaseParamPart<string>,
  EndpointConfig extends Endpoint,
  BasePath extends string = "",
  Path extends BasePathPart[]
> = (
  pathParam: EndpointConfig["path"][PathParam["name"]]
) => EndpointClient<EndpointConfig, BasePath, R>;

type EndpointCall<EndpointConfig> = {
  verb: (body: EndpointConfig["body"]) => Promise<EndpointConfig["response"]>;
};

export type EndpointClient<
  EndpointConfig extends Endpoint,
  BasePath extends string = "",
  Path extends BasePathPart[] = FilterPathParts<
    SplitPathIntoParts<EndpointConfig["endpoint"]>,
    BasePath
  >,
  H extends PathPart = Path[0]
> = Path extends [H, ...infer R]
  ? R extends BasePathPart[]
    ? H extends BaseResourcePart<string>
      ? {
          [key in H["name"]]: EndpointClient<EndpointConfig, BasePath, R>;
        }
      : EndpointPathParam<H, EndpointConfig, BasePath, R>
    : never
  : EndpointCall<EndpointConfig>;
