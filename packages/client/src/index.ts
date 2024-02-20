import type { HttpMethod } from "stainless";
import * as Tuples from "./util/tuples";

type ParamType = "z.string" | "z.number";

interface ParamTypeMap {
  "z.string": string;
  "z.number": number;
}

interface Param {
  name: string;
  type: ParamType;
}

interface Resource {
  name: string;
  params?: Param[];
}

type ParamsForResource<
  T extends Array<Param>,
  R extends Array<ParamTypeMap[ParamType]> = []
> = T extends [infer TH, ...infer TT]
  ? TH extends Param
    ? TT extends Param[]
      ? ParamsForResource<TT, [...R, ParamTypeMap[TH["type"]]]>
      : [...R, ParamTypeMap[TH["type"]]]
    : R
  : R;

interface ParamPart<T extends string> {
  type: "param";
  name: T;
}
interface ResourcePart<T extends string> {
  type: "resource";
  name: T;
}
type PathPart<T extends string> = T extends `{${infer Part}}`
  ? ParamPart<Part>
  : ResourcePart<T>;
type ExtractLeadingSlash<T extends string> = T extends `/${infer S}` ? S : T;
type ExtractRoute<
  T extends string,
  S extends string = ExtractLeadingSlash<T>
> = S extends `${infer Part}/${infer Rest}`
  ? [PathPart<Part>, ...ExtractRoute<Rest>]
  : [PathPart<S>];

export interface EndpointConfig<M extends HttpMethod, P extends string> {
  endpoint: `${M} ${P}`;
  params: Record<string, ParamType>;
}

export type Client<
  R extends [Resource, ...Resource[]],
  Rest extends Resource[] = Tuples.Shift<R>
> = Record<
  R[0]["name"],
  Rest extends [Resource, ...Resource[]]
    ? R[0]["params"] extends Param[]
      ? (...params: ParamsForResource<R[0]["params"]>) => Client<Rest>
      : Client<Rest>
    : { url(): string }
>;

// Implementation
export function endpoint<M extends HttpMethod, P extends string>(
  config: EndpointConfig<M, P>
): Client<[], []> {}
