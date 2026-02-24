import { z, SafeParseReturnType } from "zod";
import { StlContext } from "./stl";
import { SelectTree } from "./parseSelect";
import { IncludablePaths } from "./includes";
export * from "zod";
export { selects, selectsSymbol, getSelects } from "./selects";
export { includes, includesSymbol, getIncludes, IncludablePaths, } from "./includes";
declare module "zod" {
    interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
        withMetadata<M extends object>(metadata: M): ZodMetadata<this, M>;
    }
}
export interface ZodMetadataDef<T extends z.ZodTypeAny, M extends object> extends z.ZodEffectsDef {
    innerType: T;
    metadata: M;
}
/**
 * Class for storing custom metadata like `prismaModel`,
 * `pageResponse: true`, `includable: true`, etc.
 *
 * zod-openapi errors out on any new class that extends the base
 * ZodType, so I made this extend a no-op refinement for compatibility.
 * Extending ZodLazy would be another option
 */
export declare class ZodMetadata<T extends z.ZodTypeAny, M extends object> extends z.ZodEffects<T> {
    metadata: M;
    constructor(def: z.ZodEffectsDef<T>, metadata: M);
    unwrap(): T;
    static create: <T_1 extends z.ZodTypeAny, M_1 extends object>(innerType: T_1, metadata: M_1, params?: z.RawCreateParams) => ZodMetadata<T_1, M_1>;
}
export declare const withMetadata: <T extends z.ZodTypeAny, M extends object>(innerType: T, metadata: M, params?: z.RawCreateParams) => ZodMetadata<T, M>;
export type extractMetadata<T extends z.ZodTypeAny, Satisfying extends object = object> = z.ZodType<any, z.ZodTypeDef, any> extends T ? never : T extends ZodMetadata<infer U, infer M> ? M extends Satisfying ? M : extractMetadata<U, Satisfying> : T extends z.ZodOptional<infer U> ? extractMetadata<U, Satisfying> : T extends z.ZodNullable<infer U> ? extractMetadata<U, Satisfying> : T extends z.ZodDefault<infer U> ? extractMetadata<U, Satisfying> : T extends z.ZodLazy<infer U> ? extractMetadata<U, Satisfying> : T extends z.ZodEffects<infer U, any, any> ? extractMetadata<U, Satisfying> : T extends z.ZodCatch<infer U> ? extractMetadata<U, Satisfying> : T extends z.ZodBranded<infer U, any> ? extractMetadata<U, Satisfying> : T extends z.ZodPipeline<any, infer U> ? extractMetadata<U, Satisfying> : T extends z.ZodPromise<infer U> ? extractMetadata<U, Satisfying> : never;
export declare function extractMetadata<T extends z.ZodTypeAny, Satisfying extends object = object>(schema: T, satisfying?: Satisfying): extractMetadata<T, Satisfying>;
export type extractDeepMetadata<T extends z.ZodTypeAny, Satisfying extends object = object> = z.ZodType<any, z.ZodTypeDef, any> extends T ? never : T extends ZodMetadata<infer U, infer M> ? M extends Satisfying ? M : extractDeepMetadata<U, Satisfying> : T extends z.ZodOptional<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodNullable<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodDefault<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodLazy<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodEffects<infer U, any, any> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodCatch<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodBranded<infer U, any> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodPipeline<any, infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodPromise<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodArray<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodSet<infer U> ? extractDeepMetadata<U, Satisfying> : never;
export declare function extractDeepMetadata<T extends z.ZodTypeAny, Satisfying extends object = object>(schema: T, satisfying?: Satisfying): extractDeepMetadata<T, Satisfying>;
declare module "zod" {
    interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
        /**
         * Marks this schema as includable via an `include[]` query param.
         * This should only be used on object or array of object property schemas.
         */
        includable(): IncludableZodType<this>;
    }
}
export declare const includableSymbol: unique symbol;
export type IncludableOutput<T> = (NonNullable<T> & {
    readonly [includableSymbol]: {
        value: T;
    };
}) | null | undefined;
export type IncludableInput<T> = T | null | undefined;
export type IncludableZodType<T extends z.ZodTypeAny> = ZodMetadata<z.ZodType<IncludableOutput<z.output<T>>, T["_def"], IncludableInput<z.input<T>>>, {
    stainless: {
        includable: true;
    };
}>;
export type isIncludable<T extends z.ZodTypeAny> = extractDeepMetadata<T, {
    stainless: {
        includable: true;
    };
}> extends {
    stainless: {
        includable: true;
    };
} ? true : false;
export declare function isIncludable<T extends z.ZodTypeAny>(schema: T): isIncludable<T>;
declare module "zod" {
    interface ZodTypeDef {
    }
    interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
        selection<T extends z.ZodTypeAny>(this: T): z.ZodType<SelectionReturn<z.output<T>>, this["_def"], SelectionReturn<z.input<T>>>;
        /**
         * Marks this schema as selectable via a `select` query param.
         * This should only be used on object or array of object property schemas.
         * The property must have the name of a sibling property + `_fields`.
         */
        selectable(): SelectableZodType<this>;
    }
}
export declare const selectableSymbol: unique symbol;
export type SelectableOutput<T> = ((NonNullable<T> extends Array<infer E> ? Partial<E>[] : NonNullable<T> extends object ? Partial<NonNullable<T>> : T) & {
    readonly [selectableSymbol]: true;
}) | null | undefined;
export type SelectableInput<T> = T | (NonNullable<T> extends Array<infer E extends object> ? Partial<E>[] : NonNullable<T> extends object ? Partial<NonNullable<T>> : T) | null | undefined;
export type SelectableZodType<T extends z.ZodTypeAny> = z.ZodType<SelectableOutput<z.output<T>>, T["_def"], SelectableInput<z.input<T>>>;
type SelectionReturn<T> = T extends Array<infer E extends object> ? Partial<E>[] : T extends object ? Partial<T> : T;
declare module "zod" {
    interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
        safeParseAsync(data: unknown, params?: Partial<StlParseParams>): Promise<SafeParseReturnType<Input, Output>>;
        parseAsync(data: unknown, params?: Partial<StlParseParams>): Promise<Output>;
        transform<T extends z.ZodTypeAny, NewOut>(this: T, transform: (arg: Output, ctx: StlRefinementCtx) => NewOut | Promise<NewOut>): z.ZodEffects<T, NewOut>;
        /**
         * Like `.transform()`, but passes the StlContext and ParseContext
         * to the transform.
         * Currently this is used to implement `.prismaModelLoader()` in the
         * Prisma plugin.
         */
        stlTransform<T extends z.ZodTypeAny, NewOut>(this: T, transform: StlTransform<Output, NewOut>): z.ZodEffects<T, NewOut>;
    }
}
export type StlTransform<Input, Output> = (input: Input, ctx: StlContext<any>, zodInput: z.ParseInput) => Output | Promise<Output>;
export interface StlParseContext extends z.ParseContext {
    stlContext?: StlContext<any>;
}
export interface StlRefinementCtx extends z.RefinementCtx {
    stlContext?: StlContext<any>;
}
export type StlParseParams = z.ParseParams & {
    stlContext: StlContext<any>;
};
export type StlParseInput = z.ParseInput & {
    parent: StlParseContext;
};
export type StlPreprocess = (input: unknown, ctx: StlContext<any>, zodInput: z.ParseInput) => unknown;
export declare function stlPreprocess<I extends z.ZodTypeAny>(preprocess: StlPreprocess, schema: I): z.ZodEffects<I, I["_output"], unknown>;
export declare function path<T extends z.ZodRawShape>(shape: T, params?: z.RawCreateParams): z.ZodObject<T, "strip">;
export declare class StlParams<T extends z.ZodRawShape, UnknownKeys extends z.UnknownKeysParam = z.UnknownKeysParam, Catchall extends z.ZodTypeAny = z.ZodTypeAny, Output = z.objectOutputType<T, Catchall, UnknownKeys>, Input = z.objectInputType<T, Catchall, UnknownKeys>> extends z.ZodObject<T, UnknownKeys, Catchall, Output, Input> {
}
export declare function query<T extends z.ZodRawShape>(shape: T, params?: z.RawCreateParams): StlParams<T, "strip">;
export declare function body<T extends z.ZodRawShape>(shape: T, params?: z.RawCreateParams): StlParams<T, "strip">;
export declare function response<T extends z.ZodRawShape>(shape: T, params?: z.RawCreateParams): z.ZodObject<T, "strip">;
declare class PageResponseWrapper<I extends z.ZodTypeAny> {
    wrapped(item: I): z.ZodObject<{
        items: z.ZodArray<I, "many">;
        startCursor: z.ZodNullable<z.ZodString>;
        endCursor: z.ZodNullable<z.ZodString>;
        hasNextPage: z.ZodOptional<z.ZodBoolean>;
        hasPreviousPage: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        items: I["_output"][];
        startCursor: string | null;
        endCursor: string | null;
        hasNextPage?: boolean | undefined;
        hasPreviousPage?: boolean | undefined;
    }, {
        items: I["_input"][];
        startCursor: string | null;
        endCursor: string | null;
        hasNextPage?: boolean | undefined;
        hasPreviousPage?: boolean | undefined;
    }>;
}
export declare function pageResponse<I extends z.ZodTypeAny>(item: I): ZodMetadata<ReturnType<PageResponseWrapper<I>["wrapped"]>, extractDeepMetadata<I> & {
    stainless: {
        pageResponse: true;
    };
}>;
export type isPageResponse<T extends z.ZodTypeAny> = extractMetadata<T, {
    stainless: {
        pageResponse: true;
    };
}> extends {
    stainless: {
        pageResponse: true;
    };
} ? true : false;
export declare function isPageResponse<T extends z.ZodTypeAny>(schema: T): isPageResponse<T>;
export type PageData<I> = {
    items: I[];
    startCursor: string | null;
    endCursor: string | null;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
};
export type PageItemType<D> = D extends PageData<any> ? D["items"][number] : never;
export declare const AnyPageData: z.ZodType<PageData<any>, any, PageData<any>>;
export declare const SortDirection: z.ZodUnion<[z.ZodLiteral<"asc">, z.ZodLiteral<"desc">]>;
export type SortDirection = z.infer<typeof SortDirection>;
export declare const PaginationParams: z.ZodObject<{
    pageAfter: z.ZodOptional<z.ZodString>;
    pageBefore: z.ZodOptional<z.ZodString>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodString;
    sortDirection: z.ZodDefault<z.ZodUnion<[z.ZodLiteral<"asc">, z.ZodLiteral<"desc">]>>;
}, "strip", z.ZodTypeAny, {
    pageSize: number;
    sortBy: string;
    sortDirection: "asc" | "desc";
    pageAfter?: string | undefined;
    pageBefore?: string | undefined;
}, {
    sortBy: string;
    pageAfter?: string | undefined;
    pageBefore?: string | undefined;
    pageSize?: number | undefined;
    sortDirection?: "asc" | "desc" | undefined;
}>;
export type PaginationParams = z.infer<typeof PaginationParams>;
export type CircularModel<Base extends z.ZodType<object, any, object>, Props extends z.ZodRawShape> = z.ZodType<z.output<Base> & {
    [K in keyof Props]: z.output<NonNullable<Props[K]>>;
}, z.ZodTypeDef, z.input<Base> & {
    [K in keyof Props]: z.input<NonNullable<Props[K]>>;
}>;
export declare const SchemaSymbol: unique symbol;
export declare abstract class BaseSchema {
    [SchemaSymbol]: true;
    abstract input: any;
    abstract output: any;
    metadata?: object;
}
export declare class Schema<O, I = O> extends BaseSchema {
    input: I;
    output: O;
    default: O | (() => O);
    validate(value: Out<I>, ctx: StlContext<any>): void;
    transform(value: Out<I>, ctx: StlContext<any>, zodInput: z.ParseInput): Out<O> | PromiseLike<Out<O>>;
}
export type SchemaInput<I> = I | Schema<I, any>;
export declare const EffectlessSchemaSymbol: unique symbol;
export declare class Metadata<O, Metadata extends object> extends Schema<O> {
    metadata: Metadata;
}
export declare const EffectsSymbol: unique symbol;
export declare const TransformSymbol: unique symbol;
export type In<T> = 0 extends 1 & T ? any : T extends BaseSchema ? In<T["input"]> : T extends Date ? Date : T extends Array<infer E> ? Array<In<E>> : T extends Set<infer E> ? Set<In<E>> : T extends Map<infer K, infer V> ? Map<In<K>, In<V>> : T extends PromiseLike<infer E> ? PromiseLike<In<E>> : T extends object ? {
    [k in keyof T]: In<T[k]>;
} : T;
export type Out<T> = 0 extends 1 & T ? any : T extends BaseSchema ? Out<T["output"]> : T extends Date ? Date : T extends Array<infer E> ? Array<Out<E>> : T extends Set<infer E> ? Set<Out<E>> : T extends Map<infer K, infer V> ? Map<Out<K>, Out<V>> : T extends PromiseLike<infer E> ? PromiseLike<Out<E>> : T extends object ? {
    [k in keyof T]: Out<T[k]>;
} : T;
export type toZod<T> = 0 extends 1 & T ? any : [null | undefined] extends [T] ? z.ZodOptional<z.ZodNullable<toZod<NonNullable<T>>>> : [null] extends [T] ? z.ZodNullable<toZod<NonNullable<T>>> : [undefined] extends [T] ? z.ZodOptional<toZod<NonNullable<T>>> : [T] extends [z.ZodTypeAny] ? T : [T] extends [BaseSchema] ? schemaTypeToZod<T> : [T] extends [Date] ? z.ZodDate : [T] extends [Array<infer E>] ? z.ZodArray<toZod<E>> : [T] extends [Set<infer E>] ? z.ZodSet<toZod<E>> : [T] extends [Map<infer K, infer V>] ? z.ZodMap<toZod<K>, toZod<V>> : [T] extends [PromiseLike<infer E>] ? z.ZodPromise<toZod<E>> : [T] extends [object] ? z.ZodObject<{
    [k in keyof T]-?: toZod<T[k]>;
}> : [number] extends [T] ? z.ZodNumber : [string] extends [T] ? z.ZodString : [boolean] extends [T] ? z.ZodBoolean : [bigint] extends [T] ? z.ZodBigInt : z.ZodType<Out<T>, any, In<T>>;
type schemaTypeToZod<T extends BaseSchema> = T extends {
    metadata: infer M extends object;
} ? ZodMetadata<toZod<Omit<T, "metadata">>, M> : T extends {
    [ZodSchemaSymbol]: true;
    zodSchema: infer S extends z.ZodTypeAny;
} ? S : T extends {
    [IncludableSymbol]: true;
    includable: infer I;
} ? z.ZodEffects<toZod<I>, IncludableOutput<Out<I>>, IncludableInput<In<I>>> : T extends {
    [EffectsSymbol]: true;
    input: infer I;
    output: infer O;
} ? z.ZodEffects<toZod<I>, Out<O>, In<I>> : toZod<T["output"]>;
export type OptionalMessage<T> = T extends true ? true | string : T | [T, string];
export type IPOptions = true | string | {
    version?: "v4" | "v6";
    message?: string;
};
export type DateTimeOptions = true | string | {
    precision?: number;
    offset?: true;
    message?: string;
};
export interface StringSchemaProps {
    max?: OptionalMessage<number>;
    min?: OptionalMessage<number>;
    length?: OptionalMessage<number>;
    email?: OptionalMessage<true>;
    url?: OptionalMessage<true>;
    emoji?: OptionalMessage<true>;
    uuid?: OptionalMessage<true>;
    cuid?: OptionalMessage<true>;
    cuid2?: OptionalMessage<true>;
    ulid?: OptionalMessage<true>;
    regex?: OptionalMessage<string>;
    startsWith?: OptionalMessage<string>;
    endsWith?: OptionalMessage<string>;
    datetime?: DateTimeOptions;
    ip?: IPOptions;
    trim?: true;
    toLowerCase?: true;
    toUpperCase?: true;
    default?: string;
}
export type UUID = StringSchema<{
    uuid: true;
}>;
export declare const StringSchemaSymbol: unique symbol;
export declare class StringSchema<Props extends StringSchemaProps> extends Schema<string> {
    [StringSchemaSymbol]: true;
    input: string;
    props: Props;
}
export interface NumberSchemaProps {
    gt?: OptionalMessage<number>;
    gte?: OptionalMessage<number>;
    min?: OptionalMessage<number>;
    lt?: OptionalMessage<number>;
    lte?: OptionalMessage<number>;
    max?: OptionalMessage<number>;
    multipleOf?: OptionalMessage<number>;
    step?: OptionalMessage<number>;
    int?: OptionalMessage<true>;
    positive?: OptionalMessage<true>;
    nonnegative?: OptionalMessage<true>;
    negative?: OptionalMessage<true>;
    nonpositive?: OptionalMessage<true>;
    finite?: OptionalMessage<true>;
    safe?: OptionalMessage<true>;
    default?: number;
}
export declare const NumberSchemaSymbol: unique symbol;
export declare class NumberSchema<Props extends NumberSchemaProps> extends Schema<number> {
    [NumberSchemaSymbol]: true;
    input: number;
    props: Props;
}
export interface BigIntSchemaProps {
    gt?: OptionalMessage<bigint>;
    gte?: OptionalMessage<bigint>;
    min?: OptionalMessage<bigint>;
    lt?: OptionalMessage<bigint>;
    lte?: OptionalMessage<bigint>;
    max?: OptionalMessage<bigint>;
    multipleOf?: OptionalMessage<bigint>;
    positive?: OptionalMessage<true>;
    nonnegative?: OptionalMessage<true>;
    negative?: OptionalMessage<true>;
    nonpositive?: OptionalMessage<true>;
    default?: bigint;
}
export declare const BigIntSchemaSymbol: unique symbol;
export declare class BigIntSchema<Props extends BigIntSchemaProps> extends Schema<bigint> {
    [BigIntSchemaSymbol]: true;
    input: bigint;
    props: Props;
}
export interface DateSchemaProps {
    min?: OptionalMessage<string>;
    max?: OptionalMessage<string>;
}
export declare const DateSchemaSymbol: unique symbol;
export declare class DateSchema<Props extends DateSchemaProps> extends Schema<Date> {
    [DateSchemaSymbol]: true;
    input: Date;
    props: Props;
}
export interface ObjectSchemaProps {
    passthrough?: OptionalMessage<true>;
    strict?: OptionalMessage<true>;
    catchall?: any;
}
export declare const ObjectSchemaSymbol: unique symbol;
export declare class ObjectSchema<T extends object, Props extends ObjectSchemaProps> extends Schema<T> {
    [ObjectSchemaSymbol]: true;
    props: Props;
}
export interface ArraySchemaProps {
    nonempty?: OptionalMessage<true>;
    min?: OptionalMessage<number>;
    max?: OptionalMessage<number>;
    length?: OptionalMessage<number>;
}
export declare const ArraySchemaSymbol: unique symbol;
export declare class ArraySchema<T, Props extends ArraySchemaProps> extends Schema<T[]> {
    [ArraySchemaSymbol]: true;
    props: Props;
}
export declare const SetSchemaSymbol: unique symbol;
type SetSchemaProps = ArraySchemaProps;
export declare class SetSchema<T, Props extends SetSchemaProps> extends Schema<Set<T>> {
    [SetSchemaSymbol]: true;
    props: Props;
}
export declare const IncludableSymbol: unique symbol;
export declare class Includable<T> extends Schema<IncludableOutput<Out<T>>, IncludableInput<In<T>>> {
    [IncludableSymbol]: true;
    includable: T;
    metadata: {
        stainless: {
            includable: true;
        };
    };
}
export declare class Includes<T, Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3> extends Schema<IncludablePaths<Out<T>, Depth>[]> {
    metadata: {
        stainless: {
            includes: true;
        };
    };
}
export declare const SelectableSymbol: unique symbol;
export declare class Selectable<T> extends Schema<SelectableOutput<Out<T>>, SelectableInput<In<T>>> {
    [SelectableSymbol]: true;
    selectable: T;
    metadata: {
        stainless: {
            selectable: true;
        };
    };
}
export declare class Selects<T, Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3> extends Schema<SelectTree | null | undefined, string> {
    [EffectsSymbol]: true;
    metadata: {
        stainless: {
            selects: true;
        };
    };
}
export declare class Selection<T extends SchemaInput<any>> extends Schema<T> {
}
export interface PageResponseType<I> {
    startCursor: string | null;
    endCursor: string | null;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    items: I[];
}
declare const PageResponseSymbol: unique symbol;
export declare class PageResponse<I> extends Schema<PageResponseType<I>> {
    [PageResponseSymbol]: true;
    item: I;
}
declare const ZodSchemaSymbol: unique symbol;
export declare class ZodSchema<S extends {
    schema: z.ZodTypeAny;
}> extends Schema<z.output<S["schema"]>, z.input<S["schema"]>> {
    [ZodSchemaSymbol]: true;
    zodSchema: S["schema"];
}
//# sourceMappingURL=z.d.ts.map