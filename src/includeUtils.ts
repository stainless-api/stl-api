type IncludeSubPaths<
  E extends string,
  Path extends string
> = E extends `${Path}.${infer SubPath}` ? SubPath : never;

export function includeSubPaths<S extends string[], P extends string>(
  include: S,
  path: P
): IncludeSubPaths<S[number], P>[] {
  const prefix = `${path}.`;
  return include.flatMap((path) =>
    path.startsWith(prefix) ? [path.substring(prefix.length)] : []
  ) as any;
}
