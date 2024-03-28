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
import { UnionToIntersection } from "../util/union-to-intersection";
import { CamelCase, Replace } from "../util/strings";
import {
  ExtensionAdapters,
  ExtensionConfig,
  GetExtensions,
} from "../extensions";

type CallableEndpoint<
  ActionName extends string,
  EPConfig extends AnyEndpoint,
  Extensions extends ExtensionConfig,
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
            Extensions,
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
          ): CallableEndpoint<ActionName, EPConfig, Extensions, R>;
        }
      : never
    : never
  : /** Add types for API call method */ {
      [key in ActionName]: EndpointBodyInput<EPConfig> extends undefined
        ? (
            query?: z.input<EPConfig["query"]>
          ) => Promise<EndpointResponseOutput<EPConfig>> &
            GetExtensions<
              Extensions,
              EndpointBodyInput<EPConfig>,
              EndpointQueryInput<EPConfig>,
              EndpointResponseOutput<EPConfig>
            >
        : (
            body: EndpointBodyInput<EPConfig>,
            query?: z.input<EPConfig["query"]>
          ) => Promise<EndpointResponseOutput<EPConfig>> &
            GetExtensions<
              Extensions,
              EndpointBodyInput<EPConfig>,
              EndpointQueryInput<EPConfig>,
              EndpointResponseOutput<EPConfig>
            >;
    } & {
      [key in ActionName as `use${Capitalize<key>}`]: EndpointBodyInput<EPConfig> extends undefined
        ? (query?: z.input<EPConfig["query"]>) => {
            queryKey: string[];
            queryFn: () => Promise<EndpointResponseOutput<EPConfig>>;
          }
        : (
            body: EndpointBodyInput<EPConfig>,
            query?: z.input<EPConfig["query"]>
          ) => {
            queryKey: string[];
            queryFn: () => Promise<EndpointResponseOutput<EPConfig>>;
          };
    } & {
      [key in ActionName]: keyof Extensions extends string
        ? EPConfig["query"] extends undefined
          ? GetExtensions<
              Extensions,
              EndpointBodyInput<EPConfig>,
              EndpointQueryInput<EPConfig>,
              EndpointResponseOutput<EPConfig>
            >
          : "undefined"
        : "undefined";
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
  Resource extends AnyResourceConfig,
  Extensions extends ExtensionConfig
> = UnionToIntersection<
  {
    [A in keyof Resource["actions"] & string]: CallableEndpoint<
      A,
      RemoveBasePath<BasePath, Resource["actions"][A]>,
      Extensions
    >;
  }[keyof Resource["actions"] & string]
>;

export interface APIConfig {
  basePath: `/${string}`;
  resources: Record<string, AnyResourceConfig>;
}

export interface ClientConfig<BP extends string = string> {
  /**
   * This needs to match what is passed to stl.api() when creating an API
   * It is redundant, but required to have runtime access to the string in the client
   */
  basePath: BP;
  fetch?: typeof fetch;
  urlCase?: "camel" | "kebab";
  extensions?: ExtensionConfig;
}

export type Client<
  API extends APIConfig,
  Config extends ClientConfig,
  Resources = API["resources"]
> = UnionToIntersection<
  {
    [R in keyof Resources]: CallableResource<
      API["basePath"],
      Resources[R],
      Config["extensions"]
    >;
  }[keyof Resources]
>;
