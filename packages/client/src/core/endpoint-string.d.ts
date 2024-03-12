import type { HttpMethod } from "stainless";
import * as Tuple from "../util/tuples";

export { HttpMethod };

export type Endpoint = `${HttpMethod} /${string}`;

export type ExtractMethod<E extends Endpoint> =
  E extends `${infer Method} /${string}` ? Method : never;

export type ExtractPath<E extends Endpoint> =
  E extends `${string} ${infer Path}` ? Path : never;

export interface ParamPart<T extends string> {
  type: "param";
  name: T;
}

export interface ResourcePart<T extends string> {
  type: "resource";
  name: T;
}

type RemoveLeadingSlash<T extends string> = T extends `/${infer S}` ? S : T;

export type PathPart = ResourcePart | ParamPart;

type InferPathPart<T extends string> = T extends `{${infer Part}}`
  ? ParamPart<Part>
  : ResourcePart<T>;

type MaybeSpace = "" | " ";

export type SplitPathIntoParts<
  T extends string,
  S extends string = RemoveLeadingSlash<T>
> = S extends `${infer Part}/${infer Rest}`
  ? Part extends `${HttpMethod}${MaybeSpace}`
    ? [...SplitPathIntoParts<Rest>]
    : [InferPathPart<Part>, ...SplitPathIntoParts<Rest>]
  : [InferPathPart<S>];

export type FilterPathParts<
  Path extends readonly InferPathPart[],
  Filter extends string
> = Tuple.Filter<Path, ResourcePart<RemoveLeadingSlash<Filter>>>;
