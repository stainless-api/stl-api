import {
  AnyEndpoint,
  AnyResourceConfig,
  EndpointBodyInput,
  EndpointBodyOutput,
  EndpointResponseOutput,
  z,
} from "stainless";
import {
  SplitPathIntoParts,
  PathPart,
  ResourcePart,
  ParamPart,
} from "./endpoint-string";

type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

type CallableEndpoint<
  ActionName extends string,
  EPConfig extends AnyEndpoint,
  Path extends PathPart[] = SplitPathIntoParts<EPConfig["endpoint"]>,
  H extends PathPart = Path[0]
> = Path extends [H, ...infer R]
  ? R extends PathPart[]
    ? H extends ResourcePart<string>
      ? {
          [key in H["name"] as CamelCase<key>]: CallableEndpoint<
            ActionName,
            EPConfig,
            R
          >;
        }
      : H extends ParamPart<string>
      ? {
          (pathParam: EPConfig["path"][H["name"]]): CallableEndpoint<
            ActionName,
            EPConfig,
            R
          >;
        } // The pathParam _should_ work, but the type from stl.api seems incomplete
      : never
    : never
  : {
      [key in ActionName as
        | key
        | `use${Capitalize<key>}`]: EndpointBodyInput<EPConfig> extends undefined
        ? () => Promise<EndpointResponseOutput<EPConfig>>
        : (
            body: EndpointBodyInput<EPConfig>
          ) => Promise<EndpointResponseOutput<EPConfig>>;
    };

type CallableResource<Resource extends AnyResourceConfig> = {
  [A in keyof Resource["actions"] & string]: CallableEndpoint<
    A,
    Resource["actions"][A]
  >;
};

type Client<
  BasePath extends `/${string}`,
  Resources extends Record<string, AnyResourceConfig>
> = {
  [R in keyof Resources]: CallableResource<Resources[R]>;
};

export function makeClient<
  BasePath extends `/${string}`,
  Resources extends Record<string, AnyResourceConfig>
>(): Client<BasePath, Resources> {
  return {} as Client<BasePath, Resources>;
}
