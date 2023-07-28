import * as z from "./z";

/**
 * 🤨 Why not use z.coerce.boolean()?
 *
 * Well, you'd probably want `?foo=false` to coerce to `{ foo: false }`.
 * But if your schema was
 *
 *   z.object({ foo: z.coerce.boolean().optional() })
 *
 * It would coerce `?foo=false` to `{ foo: true }`...z.coerce.boolean() just
 * does JS `Boolean('false')` coercion, which isn't very helpful for params.
 *
 * defaultCoerceBoolean coerces `?foo=false` to `{ foo: false }`
 */
export const defaultCoerceBoolean = z
  .preprocess((value) => {
    switch (typeof value === "string" ? value.toLowerCase() : value) {
      case undefined:
      case "undefined": // Code might request `?foo=undefined`
      case "": // Code might request `?foo=`
        return undefined;
      case null:
      case "null": // Code might request `?foo=null`
      case "nil": // Maybe python could request `?foo=nil`
        return null;
      case true:
      case "true":
        return true;
      case false:
      case "false":
        return false;
      default:
        return value; // let z.boolean() throw an error with the raw value
    }
  }, z.boolean().nullish())
  .describe("defaultCoerceBoolean");

/**
 * 🤨 Why not use z.coerce.string()?
 *
 * Well, if you happen to have a required string param, you'd probably want
 * to throw an error if it wasn't provided.  But that's not what would happen
 * with this schema:
 *
 *   const schema = z.object({ foo: z.coerce.string() })
 *   const parsed = schema.parse({}) // { foo: 'undefined' }
 *
 * z.coerce.string() just does JS `String(undefined)` coercion, which isn't
 * very helpful for params.
 */
export const defaultCoerceString = z
  .preprocess(
    (value) =>
      value == null || typeof value === "object" ? value : String(value),
    z.string().nullish()
  )
  .describe("defaultCoerceString");

/**
 * 🤨 Why not use z.coerce.number()?
 *
 * Well, if you happen to have a number param `foo`, you probably wouldn't
 * want `?foo=` (an empty string) to get coerced to `0`. But that's not
 * what happens with this schema:
 *
 *   const schema = z.object({ foo: z.coerce.number().optional() })
 *   const parsed = schema.parse({ foo: '' }) // { foo: 0 }
 *
 * z.coerce.number() just does JS `Number('')` coercion, which unfortunately
 * evaluates to `0`.
 */
export const defaultCoerceNumber = z
  .preprocess((value) => {
    switch (typeof value === "string" ? value.toLowerCase() : value) {
      case null:
      case "null": // Code might request `?foo=null`
      case "nil": // Maybe python could request `?foo=nil`
        return null;
      case undefined:
      case "undefined": // Code might request `?foo=undefined`
      case "": // Number('') === 0 😱 Code might request `?foo=`
        return undefined;
      default:
        const parsed = Number(value);
        if (typeof value === "object" || isNaN(parsed)) {
          return value; // let z.number() throw an error with the raw value
        }
        return parsed;
    }
  }, z.number().nullish())
  .describe("defaultCoerceNumber");

/**
 * 🤨 Why not use z.coerce.bigint()?
 *
 * Well, if you have a bigint param `foo`, you probably wouldn't
 * want `?foo=` (an empty string) to get coerced to `0`. But that's not
 * what happens with this schema:
 *
 *   const schema = z.object({ foo: z.coerce.bigint().optional() })
 *   const parsed = schema.parse({ foo: '' }) // { foo: 0n }
 *
 * z.coerce.bigint() just does JS `BigInt('')` coercion, which unfortunately
 * evaluates to `0n`.
 */
export const defaultCoerceBigInt = z
  .preprocess((value) => {
    switch (typeof value === "string" ? value.toLowerCase() : value) {
      case null:
      case "null": // Code might request `?foo=null`
      case "nil": // Maybe python could request `?foo=nil`
        return null;
      case undefined:
      case "undefined": // Code might request `?foo=undefined`
      case "": // Bigint('') === 0n 😱 Code might request `?foo=`
        return undefined;
      default:
        if (typeof value === "object") return value; // let z.bigint() throw an error with the raw value
        try {
          return BigInt(value as any);
        } catch (error) {
          return value; // let z.bigint() throw an error with the raw value
        }
    }
  }, z.bigint().nullish())
  .describe("defaultCoerceBigint");

/**
 * 🤨 Why not use z.coerce.date()?
 *
 * Well, there are many requests you can imagine code making that wouldn't
 * work well with z.coerce.date()...
 *
 *   ?end_date=null            ZodError
 *   ?end_date=                ZodError
 *   ?end_date=1690517078852   ZodError
 *
 * z.coerce.date() just does JS `new Date(...)` coercion.
 */
export const defaultCoerceDate = z
  .preprocess((value) => {
    switch (typeof value === "string" ? value.toLowerCase() : value) {
      case null: // new Date(null) => 1970-01-01T00:00:00.000Z 😱 Code might request `?foo=null`
      case "null":
      case "nil": // Maybe python could request `?foo=nil`
        return null;
      case undefined:
      case "undefined": // Code might request `?foo=undefined`
      case "": // Code might request `?foo=`
        return undefined;
    }
    switch (typeof value) {
      case "string":
        if (/\d+/.test(value)) {
          // Code might request a timestamp like `?end_date=1690516673486
          let num = Number(value);
          if (num > 3000) {
            // ?end_date=2021 would probably mean Jan 1, 2021
            if (num < -(1 << 31)) num *= 1000; // new Date(num) is still in 1970...most likely a unix timestamp
            value = num;
          }
        }
        return new Date(value as any);
      case "number":
        return new Date(value);
      default:
        return value; // will pass if value is a Date; otherwise let z.date() throw an error with the raw value
    }
  }, z.date().nullish())
  .describe("defaultCoerceDate");

/**
 * Deeply converts boolean, string, number, bigint, or date schemas within the given
 * schema to automatically coerce their input.
 *
 * This is for path and query param schemas, which are typically objects with primitive
 * properties, but could be arbitrarily complex according to what the user defines.
 *
 * For example if we wanted to parse an optional number query parameter like `?foo=123`,
 * the user would provide `z.object({ foo: z.number().optional() })`.  However the raw
 * value of the query would be `{ foo: '123' }` and the string value would fail parsing.
 * But `coerceParams(z.object({ foo: z.number().optional() }))` creates a schema that
 * will automatically coerce and output `{ foo: 123 }`.
 */
export default function coerceParams<T extends z.ZodTypeAny>(
  schema: T,
  {
    coerceBoolean = defaultCoerceBoolean,
    coerceString = defaultCoerceString,
    coerceNumber = defaultCoerceNumber,
    coerceBigInt = defaultCoerceBigInt,
    coerceDate = defaultCoerceDate,
  }: {
    coerceBoolean?: z.ZodType<boolean | null | undefined, any, unknown>;
    coerceString?: z.ZodType<string | null | undefined, any, unknown>;
    coerceNumber?: z.ZodType<number | null | undefined, any, unknown>;
    coerceBigInt?: z.ZodType<bigint | null | undefined, any, unknown>;
    coerceDate?: z.ZodType<Date | null | undefined, any, unknown>;
  } = {}
): T {
  function coerceParamsInner<T extends z.ZodTypeAny>(
    schema: T,
    { discriminator }: { discriminator?: string } = {}
  ): T {
    if (schema instanceof z.ZodNumber) {
      return coerceNumber.pipe(schema) as any;
    }
    if (schema instanceof z.ZodBigInt) {
      return coerceBigInt.pipe(schema) as any;
    }
    if (schema instanceof z.ZodString) {
      return coerceString.pipe(schema) as any;
    }
    if (schema instanceof z.ZodBoolean) {
      return coerceBoolean as any;
    }
    if (schema instanceof z.ZodDate) {
      return coerceDate.pipe(schema) as any;
    }
    if (schema instanceof z.ZodLiteral) {
      switch (typeof schema.value) {
        case "string":
          return coerceString.pipe(schema) as any;
        case "number":
          return coerceNumber.pipe(schema) as any;
        case "bigint":
          return coerceBigInt.pipe(schema) as any;
        case "boolean":
          return coerceBoolean.pipe(schema) as any;
      }
      if (schema.value instanceof Date) {
        return coerceDate.pipe(schema) as any;
      }
      return schema;
    }
    if (schema instanceof z.ZodMetadata) {
      return coerceParamsInner(
        (schema as z.ZodMetadata<z.ZodTypeAny, any>).innerType()
      ).withMetadata(schema.metadata) as any;
    }
    if (schema instanceof z.ZodArray) {
      return coerceParamsInner(
        (schema as z.ZodArray<z.ZodTypeAny>).element
      ).array() as any;
    }
    if (schema instanceof z.ZodLazy) {
      return coerceParamsInner(
        (schema as z.ZodLazy<z.ZodTypeAny>).schema
      ) as any;
    }
    if (schema instanceof z.ZodObject) {
      return new z.ZodObject({
        ...schema._def,
        shape: () =>
          Object.fromEntries(
            Object.entries(schema.shape).map(([key, child]) => [
              key,
              key === discriminator
                ? child
                : coerceParamsInner(child as z.ZodTypeAny),
            ])
          ),
        catchall: coerceParamsInner(schema._def.catchall),
      }) as any;
    }
    if (schema instanceof z.ZodPromise) {
      return coerceParamsInner(
        (schema as z.ZodPromise<z.ZodTypeAny>).unwrap()
      ) as any;
    }
    if (schema instanceof z.ZodCatch) {
      return new z.ZodCatch({
        ...schema._def,
        innerType: coerceParamsInner(schema._def.innerType),
      }) as any;
    }
    if (schema instanceof z.ZodBranded) {
      return coerceParamsInner(
        (schema as z.ZodBranded<z.ZodTypeAny, any>).unwrap()
      ) as any;
    }
    if (schema instanceof z.ZodSet) {
      return z.set(
        coerceParamsInner((schema as z.ZodSet<z.ZodTypeAny>)._def.valueType)
      ) as any;
    }
    if (schema instanceof z.ZodDefault) {
      return coerceParamsInner(
        (schema as z.ZodDefault<z.ZodTypeAny>).removeDefault()
      ).default(schema._def.defaultValue()) as any;
    }
    if (schema instanceof z.ZodEffects) {
      return z.effect(
        coerceParamsInner((schema as z.ZodEffects<z.ZodTypeAny>).innerType()),
        schema._def.effect
      ) as any;
    }
    if (schema instanceof z.ZodPipeline) {
      return coerceParamsInner(
        (schema as z.ZodPipeline<z.ZodTypeAny, z.ZodTypeAny>)._def.in
      ).pipe(
        // probably shouldn't coerce in pipeline output...
        // pipeline input should have already taken care of coercion
        (schema as z.ZodPipeline<z.ZodTypeAny, z.ZodTypeAny>)._def.out
      ) as any;
    }
    if (schema instanceof z.ZodMap) {
      return z.map(
        coerceParamsInner(
          (schema as z.ZodMap<z.ZodTypeAny, z.ZodTypeAny>)._def.keyType
        ),
        coerceParamsInner(
          (schema as z.ZodMap<z.ZodTypeAny, z.ZodTypeAny>)._def.valueType
        )
      ) as any;
    }
    if (schema instanceof z.ZodDiscriminatedUnion) {
      const { discriminator } = schema;
      return z.discriminatedUnion(
        discriminator,
        schema.options.map((opt: z.ZodTypeAny) =>
          coerceParamsInner(opt, { discriminator })
        )
      ) as any;
    }
    if (schema instanceof z.ZodUnion) {
      return z.union(schema.options.map(coerceParamsInner)) as any;
    }
    if (schema instanceof z.ZodIntersection) {
      return z.intersection(
        coerceParamsInner(
          (schema as z.ZodIntersection<z.ZodTypeAny, z.ZodTypeAny>)._def.left
        ),
        coerceParamsInner(
          (schema as z.ZodIntersection<z.ZodTypeAny, z.ZodTypeAny>)._def.right
        )
      ) as any;
    }
    if (schema instanceof z.ZodRecord) {
      return z.record(
        coerceParamsInner(
          (schema as z.ZodRecord<z.ZodString, z.ZodTypeAny>).keySchema
        ),
        coerceParamsInner(
          (schema as z.ZodRecord<z.ZodString, z.ZodTypeAny>).valueSchema
        )
      ) as any;
    }
    if (schema instanceof z.ZodOptional) {
      return coerceParamsInner(
        (schema as z.ZodOptional<z.ZodTypeAny>).unwrap()
      ).optional() as any;
    }
    if (schema instanceof z.ZodNullable) {
      return coerceParamsInner(
        (schema as z.ZodNullable<z.ZodTypeAny>).unwrap()
      ).nullable() as any;
    }
    if (schema instanceof z.ZodTuple) {
      return z
        .tuple(schema.items.map(coerceParamsInner))
        .rest(
          coerceParamsInner(
            (
              schema as z.ZodTuple<
                [z.ZodTypeAny, ...z.ZodTypeAny[]],
                z.ZodTypeAny
              >
            )._def.rest
          )
        ) as any;
    }
    return schema;
  }
  return coerceParamsInner(schema);
}
