"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultCoerceDate = exports.defaultCoerceBigInt = exports.defaultCoerceNumber = exports.defaultCoerceString = exports.defaultCoerceBoolean = void 0;
const z = __importStar(require("./z.js"));
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
exports.defaultCoerceBoolean = z
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
exports.defaultCoerceString = z
    .string()
    .nullish()
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
exports.defaultCoerceNumber = z
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
exports.defaultCoerceBigInt = z
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
            if (typeof value === "object")
                return value; // let z.bigint() throw an error with the raw value
            try {
                return BigInt(value);
            }
            catch (error) {
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
exports.defaultCoerceDate = z
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
                    if (num < -(1 << 31))
                        num *= 1000; // new Date(num) is still in 1970...most likely a unix timestamp
                    value = num;
                }
            }
            return new Date(value);
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
function coerceParams(schema, { coerceBoolean = exports.defaultCoerceBoolean, coerceString = exports.defaultCoerceString, coerceNumber = exports.defaultCoerceNumber, coerceBigInt = exports.defaultCoerceBigInt, coerceDate = exports.defaultCoerceDate, } = {}) {
    function coerceParamsInner(schema, { discriminator } = {}) {
        if (schema instanceof z.ZodNumber) {
            return coerceNumber.pipe(schema);
        }
        if (schema instanceof z.ZodBigInt) {
            return coerceBigInt.pipe(schema);
        }
        if (schema instanceof z.ZodString) {
            return coerceString.pipe(schema);
        }
        if (schema instanceof z.ZodBoolean) {
            return coerceBoolean;
        }
        if (schema instanceof z.ZodDate) {
            return coerceDate.pipe(schema);
        }
        if (schema instanceof z.ZodLiteral) {
            switch (typeof schema.value) {
                case "string":
                    return coerceString.pipe(schema);
                case "number":
                    return coerceNumber.pipe(schema);
                case "bigint":
                    return coerceBigInt.pipe(schema);
                case "boolean":
                    return coerceBoolean.pipe(schema);
            }
            if (schema.value instanceof Date) {
                return coerceDate.pipe(schema);
            }
            return schema;
        }
        if (schema instanceof z.ZodMetadata) {
            return coerceParamsInner(schema.innerType()).withMetadata(schema.metadata);
        }
        if (schema instanceof z.ZodArray) {
            return coerceParamsInner(schema.element).array();
        }
        if (schema instanceof z.ZodLazy) {
            return coerceParamsInner(schema.schema);
        }
        if (schema instanceof z.ZodObject) {
            return new z.ZodObject(Object.assign(Object.assign({}, schema._def), { shape: () => Object.fromEntries(Object.entries(schema.shape).map(([key, child]) => [
                    key,
                    key === discriminator
                        ? child
                        : coerceParamsInner(child),
                ])), catchall: coerceParamsInner(schema._def.catchall) }));
        }
        if (schema instanceof z.ZodPromise) {
            return coerceParamsInner(schema.unwrap());
        }
        if (schema instanceof z.ZodCatch) {
            return new z.ZodCatch(Object.assign(Object.assign({}, schema._def), { innerType: coerceParamsInner(schema._def.innerType) }));
        }
        if (schema instanceof z.ZodBranded) {
            return coerceParamsInner(schema.unwrap());
        }
        if (schema instanceof z.ZodSet) {
            return z.set(coerceParamsInner(schema._def.valueType));
        }
        if (schema instanceof z.ZodDefault) {
            return coerceParamsInner(schema.removeDefault()).default(schema._def.defaultValue());
        }
        if (schema instanceof z.ZodEffects) {
            return z.effect(coerceParamsInner(schema.innerType()), schema._def.effect);
        }
        if (schema instanceof z.ZodPipeline) {
            return coerceParamsInner(schema._def.in).pipe(
            // probably shouldn't coerce in pipeline output...
            // pipeline input should have already taken care of coercion
            schema._def.out);
        }
        if (schema instanceof z.ZodMap) {
            return z.map(coerceParamsInner(schema._def.keyType), coerceParamsInner(schema._def.valueType));
        }
        if (schema instanceof z.ZodDiscriminatedUnion) {
            const { discriminator } = schema;
            return z.discriminatedUnion(discriminator, schema.options.map((opt) => coerceParamsInner(opt, { discriminator })));
        }
        if (schema instanceof z.ZodUnion) {
            return z.union(schema.options.map(coerceParamsInner));
        }
        if (schema instanceof z.ZodIntersection) {
            return z.intersection(coerceParamsInner(schema._def.left), coerceParamsInner(schema._def.right));
        }
        if (schema instanceof z.ZodRecord) {
            return z.record(coerceParamsInner(schema.keySchema), coerceParamsInner(schema.valueSchema));
        }
        if (schema instanceof z.ZodOptional) {
            return coerceParamsInner(schema.unwrap()).optional();
        }
        if (schema instanceof z.ZodNullable) {
            return coerceParamsInner(schema.unwrap()).nullable();
        }
        if (schema instanceof z.ZodTuple) {
            return z
                .tuple(schema.items.map(coerceParamsInner))
                .rest(coerceParamsInner(schema._def.rest));
        }
        return schema;
    }
    return coerceParamsInner(schema);
}
exports.default = coerceParams;
//# sourceMappingURL=coerceParams.js.map