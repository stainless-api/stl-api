import { z, StlContext } from "./stl";

/**
 * Creates an include param from all includable paths in the given zod schema
 */
export function includes<
  T extends z.ZodTypeAny,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3
>(
  schema: T,
  depth: Depth = 3 as any
): z.ZodMetadata<
  z.ZodType<IncludablePaths<z.output<T>, Depth>[]>,
  { stainless: { includes: true } }
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
      const obj = unwrapIncludable(value);
      if (!obj) continue;
      const subpath = path ? `${path}.${key}` : key;
      if (z.isIncludable(value)) values.push(subpath);
      add(subpath, obj, depth - 1);
    }
  }
  const obj = unwrapIncludable(schema);
  if (obj) add("", obj, depth);
  const [first, ...rest] = values;
  if (!first) {
    throw new Error(`schema has no includable properties`);
  }
  return (
    z.array(z.enum([first, ...rest])) as any as z.ZodType<
      IncludablePaths<z.output<T>, Depth>[]
    >
  ).withMetadata({ stainless: { includes: true } });
}

/**
 * Given an zod schema from `includes`, extracts the possible options
 */
export function includesOptions<V extends string[]>(param: z.ZodType<V>): V {
  if (
    param instanceof z.ZodOptional ||
    param instanceof z.ZodNullable ||
    param instanceof z.ZodMetadata
  )
    return includesOptions(param.unwrap());
  if (param instanceof z.ZodDefault)
    return includesOptions(param._def.innerType);
  if (!(param instanceof z.ZodArray)) {
    throw new Error(`param must be a ZodArray of a ZodEnum of string`);
  }
  const { element } = param;
  if (!(element instanceof z.ZodEnum)) {
    throw new Error(`param must be a ZodArray of a ZodEnum of string`);
  }
  return element.options;
}

function unwrapIncludable(e: z.ZodTypeAny): z.AnyZodObject | undefined {
  if (e instanceof z.ZodObject) {
    return e;
  }
  if (
    e instanceof z.ZodOptional ||
    e instanceof z.ZodNullable ||
    e instanceof z.ZodMetadata
  ) {
    return unwrapIncludable(e.unwrap());
  }
  if (e instanceof z.ZodDefault) {
    return unwrapIncludable(e._def.innerType);
  }
  if (e instanceof z.ZodLazy) {
    return unwrapIncludable(e.schema);
  }
  if (e instanceof z.ZodEffects) {
    return unwrapIncludable(e.innerType());
  }
  if (e instanceof z.ZodArray) {
    return unwrapIncludable(e.element);
  }
  if (e instanceof z.ZodPipeline) {
    return unwrapIncludable(e._def.out);
  }
  // TODO: union, intersection, discriminated union?
}

export type IncludableKeys<Model> = Model extends object
  ? {
      [K in keyof Model & string]-?: NonNullable<
        Model[K]
      > extends z.IncludableOutput<unknown>
        ? K
        : never;
    }[keyof Model & string]
  : never;

type Decrement = [0, 0, 1, 2, 3, 4, 5];

export type IncludablePaths<
  Model,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3
> = Model extends object
  ?
      | IncludableKeys<Model>
      | (Depth extends 0
          ? never
          : {
              [K in keyof Model & string]-?: NonNullable<
                Model[K]
              > extends z.IncludableOutput<(infer T extends object)[]>
                ? `${K}.${IncludablePaths<T, Decrement[Depth]>}`
                : NonNullable<Model[K]> extends z.IncludableOutput<
                    null | undefined | infer T extends object
                  >
                ? `${K}.${IncludablePaths<NonNullable<T>, Decrement[Depth]>}`
                : NonNullable<Model[K]> extends Array<infer T>
                ? `${K}.${IncludablePaths<T, Decrement[Depth]>}`
                : never;
            }[keyof Model & string])
  : never;

type ExpandSubPaths<
  E extends string,
  Path extends string
> = E extends `${Path}.${infer SubPath}` ? SubPath : never;

export function includeSubPaths<S extends string[], P extends string>(
  include: S,
  path: P
): ExpandSubPaths<S[number], P>[] {
  const prefix = `${path}.`;
  return include.flatMap((path) =>
    path.startsWith(prefix) ? [path.substring(prefix.length)] : []
  ) as any;
}

export function getIncludes(ctx: StlContext<any>): string[] | null | undefined {
  const include = ctx.parsedParams?.query?.include;
  if (
    include != null &&
    (!Array.isArray(include) || include.some((e) => typeof e !== "string"))
  ) {
    throw new Error(`invalid include param; use z.includes()`);
  }
  return include;
}
