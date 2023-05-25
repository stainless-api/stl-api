import { z, StlContext } from "./stl";

/**
 * Creates an expand param from all expandable paths in the given zod schema
 */
export function expands<
  T extends z.ZodTypeAny,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5
>(
  schema: T,
  depth: Depth
): z.WithStainlessMetadata<
  z.ZodType<ExpandablePaths<z.output<T>, Depth>[]>,
  { expands: true }
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
      if (isExpandable(value)) values.push(subpath);
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
  ).stlMetadata({ expands: true });
}

/**
 * Given an zod schema from `expands`, extracts the possible options
 */
export function expandsOptions<V extends string[]>(param: z.ZodType<V>): V {
  if (param instanceof z.ZodOptional || param instanceof z.ZodNullable)
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

function isExpandable<T extends z.ZodTypeAny>(e: T): boolean {
  return z.extractStainlessMetadata(e)?.expandable ?? false;
}

function unwrapExpandable(e: z.ZodTypeAny): z.AnyZodObject | undefined {
  if (e instanceof z.ZodObject) {
    return e;
  }
  if (e instanceof z.ZodOptional || e instanceof z.ZodNullable) {
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
