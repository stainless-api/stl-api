import { mapValues } from "lodash";
import { z, StlContext } from "./stl";

/**
 * Creates an expand param from all expandable paths in the given zod schema
 */
export function expands<
  T extends z.ZodTypeAny,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3
>(
  schema: T,
  depth: Depth = 3 as any
): z.ZodMetadata<
  z.ZodType<ExpandablePaths<z.output<T>, Depth>[]>,
  { stainless: { expands: true } }
> {
  const values: string[] = [];

  function add<T extends z.AnyZodObject>(
    path: string,
    schema: T,
    depth: number
  ) {
    if (depth < 0) return;
    const { shape } = schema;
    for (const key in shape) {
      const value = shape[key];
      const obj = unwrapExpandable(value);
      if (!obj) continue;
      const subpath = path ? `${path}.${key}` : key;
      if (z.isExpandable(value)) values.push(subpath);
      add(subpath, obj, depth - 1);
    }
  }
  const obj = unwrapExpandable(schema);
  if (obj) add("", obj, depth);
  const [first, ...rest] = values;
  if (!first) {
    throw new Error(`schema has no expandable properties`);
  }
  return (
    z.array(z.enum([first, ...rest])) as any as z.ZodType<
      ExpandablePaths<z.output<T>, Depth>[]
    >
  ).withMetadata({ stainless: { expands: true } });
}

/**
 * Given an zod schema from `expands`, extracts the possible options
 */
export function expandsOptions<V extends string[]>(param: z.ZodType<V>): V {
  if (
    param instanceof z.ZodOptional ||
    param instanceof z.ZodNullable ||
    param instanceof z.ZodMetadata
  )
    return expandsOptions(param.unwrap());
  if (param instanceof z.ZodDefault)
    return expandsOptions(param._def.innerType);
  if (!(param instanceof z.ZodArray)) {
    throw new Error(`param must be a ZodArray of a ZodEnum of string`);
  }
  const { element } = param;
  if (!(element instanceof z.ZodEnum)) {
    throw new Error(`param must be a ZodArray of a ZodEnum of string`);
  }
  return element.options;
}

function unwrapExpandable(e: z.ZodTypeAny): z.AnyZodObject | undefined {
  if (e instanceof z.ZodObject) {
    return e;
  }
  if (
    e instanceof z.ZodOptional ||
    e instanceof z.ZodNullable ||
    e instanceof z.ZodMetadata
  ) {
    return unwrapExpandable(e.unwrap());
  }
  if (e instanceof z.ZodDefault) {
    return unwrapExpandable(e._def.innerType);
  }
  if (e instanceof z.ZodLazy) {
    return unwrapExpandable(e.schema);
  }
  if (e instanceof z.ZodEffects) {
    return unwrapExpandable(e.innerType());
  }
  if (e instanceof z.ZodArray) {
    return unwrapExpandable(e.element);
  }
  if (e instanceof z.ZodPipeline) {
    return unwrapExpandable(e._def.out);
  }
  // TODO: union, intersection, discriminated union?
}

export type ExpandableKeys<Model> = Model extends object
  ? {
      [K in keyof Model & string]-?: NonNullable<
        Model[K]
      > extends z.ExpandableOutput<unknown>
        ? K
        : never;
    }[keyof Model & string]
  : never;

type Decrement = [0, 0, 1, 2, 3, 4, 5];

export type ExpandablePaths<
  Model,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3
> = Model extends object
  ?
      | ExpandableKeys<Model>
      | (Depth extends 0
          ? never
          : {
              [K in keyof Model & string]-?: NonNullable<
                Model[K]
              > extends z.ExpandableOutput<(infer T extends object)[]>
                ? `${K}.${ExpandablePaths<T, Decrement[Depth]>}`
                : NonNullable<Model[K]> extends z.ExpandableOutput<
                    null | undefined | infer T extends object
                  >
                ? `${K}.${ExpandablePaths<NonNullable<T>, Decrement[Depth]>}`
                : NonNullable<Model[K]> extends Array<infer T>
                ? `${K}.${ExpandablePaths<T, Decrement[Depth]>}`
                : never;
            }[keyof Model & string])
  : never;

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

export function getExpands(ctx: StlContext<any>): string[] | null | undefined {
  const expand = ctx.parsedParams?.query?.expand;
  if (
    expand != null &&
    (!Array.isArray(expand) || expand.some((e) => typeof e !== "string"))
  ) {
    throw new Error(`invalid expand param; use z.expands()`);
  }
  return expand;
}

export type parseInclude<I extends string | string[]> = [I] extends [string[]]
  ? parseIncludeHelper<I[number]>
  : [I] extends [string]
  ? parseIncludeHelper<I>
  : never;

type parseIncludeHelper<I extends string> = InvalidIncludeError<I> extends never
  ? parseIncludeHelper2<I>
  : InvalidIncludeError<I>;

type InvalidIncludeError<I extends string> = [I] extends [never]
  ? never
  : I extends `.${string}` | `${string}.` | `${string}..${string}`
  ? { ERROR: `invalid include: ${I}` }
  : never;

type parseIncludeHelper2<I extends string> = {
  include: {
    [k in IncludePrefix<I>]: parseIncludeChildren<I, k>;
  };
};

type IncludePrefix<I extends string> = I extends `${infer Prefix}.${string}`
  ? Prefix
  : I;

type parseIncludeChildren<I extends string, k extends string> = StripPrefix<
  I,
  k
> extends never
  ? {}
  : parseIncludeHelper2<StripPrefix<I, k>>;

type StripPrefix<
  I extends string,
  Prefix extends string
> = I extends `${Prefix}.${infer Rest}` ? Rest : never;

export function parseInclude<I extends string[]>(include: I): parseInclude<I> {
  for (const term of include) {
    if (/^\.|\.$|\.\./.test(term)) throw new Error(`invalid include: ${term}`);
  }
  return parseIncludeHelper(include);
}

function parseIncludeHelper<I extends string[]>(include: I): parseInclude<I> {
  const groups: Record<string, string[]> = {};
  for (const term of include) {
    const [, prefix, rest] = /^([^.]+)(?:\.(.+))?$/.exec(term) || [, term];
    const group = groups[prefix] || (groups[prefix] = []);
    if (rest) group.push(rest);
  }
  return {
    include: mapValues(groups, (child) =>
      child.length ? parseIncludeHelper(child) : {}
    ),
  } as any;
}
