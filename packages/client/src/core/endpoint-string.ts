import type { HttpMethod } from "stainless";

export { HttpMethod };

export type Endpoint = `${HttpMethod} /${string}`;

export type ExtractMethod<E extends Endpoint> =
  E extends `${infer Method} /${string}` ? Method : never;

export type ExtractPath<E extends Endpoint> =
  E extends `${string} ${infer Path}` ? Path : never;

interface ParamPart<T extends string> {
  type: "param";
  name: T;
}

interface ResourcePart<T extends string> {
  type: "resource";
  name: T;
}

type RemoveLeadingSlash<T extends string> = T extends `/${infer S}` ? S : T;

type PathPart<T extends string> = T extends `{${infer Part}}`
  ? ParamPart<Part>
  : ResourcePart<T>;

export type SplitPathIntoParts<
  T extends string,
  S extends string = RemoveLeadingSlash<T>
> = S extends `${infer Part}/${infer Rest}`
  ? [PathPart<Part>, ...SplitPathIntoParts<Rest>]
  : [PathPart<S>];
