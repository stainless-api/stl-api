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
export declare const defaultCoerceBoolean: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodBoolean>>, boolean | null | undefined, unknown>;
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
export declare const defaultCoerceString: z.ZodOptional<z.ZodNullable<z.ZodString>>;
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
export declare const defaultCoerceNumber: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, number | null | undefined, unknown>;
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
export declare const defaultCoerceBigInt: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodBigInt>>, bigint | null | undefined, unknown>;
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
export declare const defaultCoerceDate: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodDate>>, Date | null | undefined, unknown>;
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
export default function coerceParams<T extends z.ZodTypeAny>(schema: T, { coerceBoolean, coerceString, coerceNumber, coerceBigInt, coerceDate, }?: {
    coerceBoolean?: z.ZodType<boolean | null | undefined, any, unknown>;
    coerceString?: z.ZodType<string | null | undefined, any, unknown>;
    coerceNumber?: z.ZodType<number | null | undefined, any, unknown>;
    coerceBigInt?: z.ZodType<bigint | null | undefined, any, unknown>;
    coerceDate?: z.ZodType<Date | null | undefined, any, unknown>;
}): T;
//# sourceMappingURL=coerceParams.d.ts.map