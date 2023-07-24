import { IncludablePaths } from "./includes";
import { SelectTree, z } from "./stl";
export declare const SchemaSymbol: unique symbol;
export declare abstract class Schema {
    [SchemaSymbol]: true;
    abstract input: any;
    abstract output: any;
    metadata?: object;
}
export type SchemaInput<I> = I | (Schema & {
    output: I;
});
export declare const EffectlessSchemaSymbol: unique symbol;
export declare abstract class EffectlessSchema extends Schema {
    [EffectlessSchemaSymbol]: true;
    output: output<this["input"]>;
}
export declare class Metadata<Input, Metadata extends object> extends EffectlessSchema {
    input: Input;
    metadata: Metadata;
}
export declare const EffectsSymbol: unique symbol;
export declare abstract class Effects extends Schema {
    [EffectsSymbol]: true;
}
export declare const TransformSymbol: unique symbol;
export declare abstract class Transform extends Effects {
    [TransformSymbol]: true;
    output: UnwrapPromise<ReturnType<this["transform"]>>;
    abstract transform(value: output<this["input"]>): any;
}
export type input<T> = 0 extends 1 & T ? any : T extends Schema ? input<T["input"]> : T extends Date ? Date : T extends Array<infer E> ? Array<input<E>> : T extends Set<infer E> ? Set<input<E>> : T extends Map<infer K, infer V> ? Map<input<K>, input<V>> : T extends PromiseLike<infer E> ? PromiseLike<input<E>> : T extends object ? {
    [k in keyof T]: input<T[k]>;
} : T;
export type output<T> = 0 extends 1 & T ? any : T extends Schema ? T["output"] : T extends Date ? Date : T extends Array<infer E> ? Array<output<E>> : T extends Set<infer E> ? Set<output<E>> : T extends Map<infer K, infer V> ? Map<output<K>, output<V>> : T extends PromiseLike<infer E> ? PromiseLike<output<E>> : T extends object ? {
    [k in keyof T]: output<T[k]>;
} : T;
type UnwrapPromise<T> = T extends PromiseLike<infer V> ? V : T;
export type toZod<T> = 0 extends 1 & T ? any : [null | undefined] extends [T] ? z.ZodOptional<z.ZodNullable<toZod<NonNullable<T>>>> : [null] extends [T] ? z.ZodNullable<toZod<NonNullable<T>>> : [undefined] extends [T] ? z.ZodOptional<toZod<NonNullable<T>>> : [T] extends [z.ZodTypeAny] ? T : [T] extends [Schema] ? schemaTypeToZod<T> : [T] extends [Date] ? z.ZodDate : [T] extends [Array<infer E>] ? z.ZodArray<toZod<E>> : [T] extends [Set<infer E>] ? z.ZodSet<toZod<E>> : [T] extends [Map<infer K, infer V>] ? z.ZodMap<toZod<K>, toZod<V>> : [T] extends [PromiseLike<infer E>] ? z.ZodPromise<toZod<E>> : [T] extends [object] ? z.ZodObject<{
    [k in keyof T]-?: toZod<T[k]>;
}> : [number] extends [T] ? z.ZodNumber : [string] extends [T] ? z.ZodString : [boolean] extends [T] ? z.ZodBoolean : [bigint] extends [T] ? z.ZodBigInt : z.ZodType<output<T>, any, input<T>>;
type schemaTypeToZod<T extends Schema> = T extends {
    metadata: infer M extends object;
} ? z.ZodMetadata<toZod<Omit<T, "metadata">>, M> : T extends EffectlessSchema ? toZod<T["input"]> : T extends {
    [IncludableSymbol]: true;
    includable: infer I;
} ? z.ZodEffects<toZod<I>, z.IncludableOutput<output<I>>, z.IncludableInput<input<I>>> : T extends {
    [EffectsSymbol]: true;
    input: infer I;
    output: infer O;
} ? z.ZodEffects<toZod<I>, O, input<I>> : toZod<T["input"]>;
export declare const RefineSymbol: unique symbol;
export declare abstract class Refine extends Effects {
    [RefineSymbol]: true;
    output: this["refine"] extends (value: any) => value is infer O ? O : output<this["input"]>;
    abstract refine(value: output<this["input"]>): boolean;
    message?: string | z.CustomErrorParams | ((arg: output<this["input"]>) => z.CustomErrorParams);
}
export declare const SuperRefineSymbol: unique symbol;
export declare abstract class SuperRefine extends Effects {
    [SuperRefineSymbol]: true;
    output: this["superRefine"] extends (value: any) => value is infer O ? O : output<this["input"]>;
    abstract superRefine(value: output<this["input"]>, ctx: z.RefinementCtx): boolean;
}
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
}
export declare const StringSchemaSymbol: unique symbol;
export declare class StringSchema<Props extends StringSchemaProps> extends EffectlessSchema {
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
}
export declare const NumberSchemaSymbol: unique symbol;
export declare class NumberSchema<Props extends NumberSchemaProps> extends EffectlessSchema {
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
}
export declare const BigIntSchemaSymbol: unique symbol;
export declare class BigIntSchema<Props extends BigIntSchemaProps> extends EffectlessSchema {
    [BigIntSchemaSymbol]: true;
    input: bigint;
    props: Props;
}
export interface DateSchemaProps {
    min?: OptionalMessage<string>;
    max?: OptionalMessage<string>;
}
export declare const DateSchemaSymbol: unique symbol;
export declare class DateSchema<Props extends DateSchemaProps> extends EffectlessSchema {
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
export declare class ObjectSchema<T extends object, Props extends ObjectSchemaProps> extends EffectlessSchema {
    [ObjectSchemaSymbol]: true;
    input: T;
    props: Props;
}
export interface ArraySchemaProps {
    nonempty?: OptionalMessage<true>;
    min?: OptionalMessage<number>;
    max?: OptionalMessage<number>;
    length?: OptionalMessage<number>;
}
export declare const ArraySchemaSymbol: unique symbol;
export declare class ArraySchema<T, Props extends ArraySchemaProps> extends Schema {
    [ArraySchemaSymbol]: true;
    input: input<T>[];
    output: output<T>[];
    props: Props;
}
export declare const SetSchemaSymbol: unique symbol;
type SetSchemaProps = ArraySchemaProps;
export declare class SetSchema<T, Props extends SetSchemaProps> extends Schema {
    [SetSchemaSymbol]: true;
    input: input<T>[];
    output: output<T>[];
    props: Props;
}
export declare const IncludableSymbol: unique symbol;
export declare class Includable<T> extends Effects {
    [IncludableSymbol]: true;
    includable: T;
    input: z.IncludableInput<input<T>>;
    output: z.IncludableOutput<output<T>>;
    metadata: {
        stainless: {
            includable: true;
        };
    };
}
export declare class Includes<T, Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3> extends EffectlessSchema {
    input: IncludablePaths<output<T>, Depth>[];
    metadata: {
        stainless: {
            includes: true;
        };
    };
}
export declare const SelectableSymbol: unique symbol;
export declare class Selectable<T> extends Effects {
    [SelectableSymbol]: true;
    selectable: T;
    input: z.SelectableInput<input<T>>;
    output: z.SelectableOutput<output<T>>;
    metadata: {
        stainless: {
            selectable: true;
        };
    };
}
export declare class Selects<T, Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3> extends Effects {
    [EffectsSymbol]: true;
    input: string;
    output: SelectTree | null | undefined;
    metadata: {
        stainless: {
            selects: true;
        };
    };
}
export declare class Selection<T extends SchemaInput<any>> extends EffectlessSchema {
    input: T;
}
export interface PageResponseType<I> {
    startCursor: string | null;
    endCursor: string | null;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    items: I[];
}
declare const PageResponseSymbol: unique symbol;
export declare class PageResponse<I> extends EffectlessSchema {
    [PageResponseSymbol]: true;
    item: I;
    input: PageResponseType<I>;
}
export declare class ZodSchema<S extends {
    schema: z.ZodTypeAny;
}> extends Effects {
    input: z.input<S["schema"]>;
    output: z.output<S["schema"]>;
}
export {};
//# sourceMappingURL=t.d.ts.map