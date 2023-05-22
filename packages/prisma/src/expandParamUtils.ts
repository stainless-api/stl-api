import z from "zod";

/**
 * Given an zod schema from `expandParam`, extracts the possible options
 */
export function expandParamOptions<V extends string[]>(param: z.ZodType<V>): V {
  if (param instanceof z.ZodOptional || param instanceof z.ZodNullable)
    return expandParamOptions(param.unwrap());
  if (param instanceof z.ZodDefault)
    return expandParamOptions(param._def.innerType);
  if (!(param instanceof z.ZodArray)) {
    throw new Error(`param must be a ZodArray of a ZodEnum of string`);
  }
  const { element } = param;
  if (!(element instanceof z.ZodEnum)) {
    throw new Error(`param must be a ZodArray of a ZodEnum of string`);
  }
  return element.options;
}

type ExpandSubPaths<
  E extends string,
  Path extends string
> = E extends `${Path}.${infer SubPath}` ? SubPath : never;

export function expandSubPaths<S extends string[], P extends string>(
  expand: S,
  path: P
): ExpandSubPaths<S[number], P>[] {
  const prefix = `${path}.`;
  return expand.flatMap((path) =>
    path.startsWith(prefix) ? [path.substring(prefix.length)] : []
  ) as any;
}
/**
 * Given a set of expands like `['items.user', 'items.comments.user']`, adds
 * parent paths, so the result is
 * `new Set(['items', 'items.user', 'items.comments', 'items.comments.user'])`
 */
export function addExpandParents(expand: string[]): Set<string> {
  const result: Set<string> = new Set();
  function add(path: string) {
    result.add(path);
    const lastDot = path.lastIndexOf(".");
    if (lastDot >= 0) {
      add(path.slice(0, lastDot));
    }
  }
  expand.forEach(add);
  return result;
}
