import {
  AnyEndpoint,
  AnyResourceConfig,
  Endpoint,
  EndpointBodyInput,
  EndpointResponseOutput,
} from "stainless";
import {
  SplitPathIntoParts,
  PathPart,
  ResourcePathPart,
  ParamPathPart,
} from "./endpoint-string";
import { UnionToIntersection } from "../util/unnest";
import { CamelCase, Replace } from "../util/strings";

type CallableEndpoint<
  ActionName extends string,
  EPConfig extends AnyEndpoint,
  Path extends PathPart[] = SplitPathIntoParts<EPConfig["endpoint"]>,
  H extends PathPart = Path[0]
> = Path extends [H, ...infer R]
  ? R extends PathPart[]
    ? H extends ResourcePathPart<string>
      ? /** Add types for path resource */
        {
          [key in H["name"] as CamelCase<H["name"]>]: CallableEndpoint<
            ActionName,
            EPConfig,
            R
          >;
        }
      : H extends ParamPathPart<string>
      ? /** Add types for path parameter method */
        {
          <AN extends ActionName>(
            /** Unfortunately, we can't name the parameter dynamically, at least not yet: https://github.com/microsoft/TypeScript/issues/56093 */
            pathParam: /** The pathParam _should_ be EPConfig["path"][H["name"]], but the types from stl.api seem incomplete and so that was always unknown */
            | (string | number)
              | ({ [param in H["name"]]: string | number } & {
                  /**
                   * We can't name the parameter dynamically, at least not yet: https://github.com/microsoft/TypeScript/issues/56093
                   * Right now the discriminator param is to allow the function overrides to be discriminated between.
                   */
                  discriminator: AN;
                })
          ): CallableEndpoint<ActionName, EPConfig, R>;
        }
      : never
    : never
  : /** Add types for API call method */ {
      [key in ActionName as
        | key
        | `use${Capitalize<key>}`]: EndpointBodyInput<EPConfig> extends undefined
        ? () => Promise<EndpointResponseOutput<EPConfig>>
        : (
            body: EndpointBodyInput<EPConfig>
          ) => Promise<EndpointResponseOutput<EPConfig>>;
    };

type RemoveBasePath<
  BasePath extends `/${string}`,
  EPConfig extends AnyEndpoint
> = Endpoint<
  EPConfig["config"],
  Replace<EPConfig["endpoint"], BasePath, "">,
  EPConfig["path"],
  EPConfig["query"],
  EPConfig["body"],
  EPConfig["response"]
>;

type CallableResource<
  BasePath extends `/${string}`,
  Resource extends AnyResourceConfig
> = UnionToIntersection<
  {
    [A in keyof Resource["actions"] & string]: CallableEndpoint<
      A,
      RemoveBasePath<BasePath, Resource["actions"][A]>
    >;
  }[keyof Resource["actions"] & string]
>;

export type Client<
  BasePath extends `/${string}`,
  Resources extends Record<string, AnyResourceConfig>
> = UnionToIntersection<
  {
    [R in keyof Resources]: CallableResource<BasePath, Resources[R]>;
  }[keyof Resources]
>;
