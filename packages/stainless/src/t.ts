import { IncludablePaths } from "./includes";
import { SelectTree, z } from "./stl";

export const SchemaSymbol = Symbol("SchemaType");

export abstract class Schema {
  declare [SchemaSymbol]: true;
  declare abstract input: any;
  declare abstract output: any;
  declare metadata?: object;
}

export type SchemaInput<I> = I | { [SchemaSymbol]: true; output: I };

export abstract class EffectlessSchema extends Schema {
  declare output: output<this["input"]>;
}

export class Metadata<Input, Metadata extends object> extends EffectlessSchema {
  declare input: Input;
  declare metadata: Metadata;
}
export const EffectsSymbol = Symbol("Effects");

export abstract class Effects extends Schema {
  declare [EffectsSymbol]: true;
}

export const TransformSymbol = Symbol("Transform");

export abstract class Transform extends Effects {
  declare [TransformSymbol]: true;
  declare output: UnwrapPromise<ReturnType<this["transform"]>>;
  abstract transform(value: output<this["input"]>): any;
}

export type input<T> = 0 extends 1 & T
  ? any
  : T extends Schema
  ? input<T["input"]>
  : T extends Date
  ? Date
  : T extends Array<infer E>
  ? Array<input<E>>
  : T extends Set<infer E>
  ? Set<input<E>>
  : T extends Map<infer K, infer V>
  ? Map<input<K>, input<V>>
  : T extends PromiseLike<infer E>
  ? PromiseLike<input<E>>
  : T extends object
  ? { [k in keyof T]: input<T[k]> }
  : T;

export type output<T> = 0 extends 1 & T
  ? any
  : T extends Schema
  ? T["output"]
  : T extends Date
  ? Date
  : T extends Array<infer E>
  ? Array<output<E>>
  : T extends Set<infer E>
  ? Set<output<E>>
  : T extends Map<infer K, infer V>
  ? Map<output<K>, output<V>>
  : T extends PromiseLike<infer E>
  ? PromiseLike<output<E>>
  : T extends object
  ? { [k in keyof T]: output<T[k]> }
  : T;

type UnwrapPromise<T> = T extends PromiseLike<infer V> ? V : T;

export type toZod<T> = [0] extends [1 & T]
  ? any
  : [T] extends [z.ZodTypeAny]
  ? T
  : [null | undefined] extends [T]
  ? z.ZodOptional<z.ZodNullable<toZod<NonNullable<T>>>>
  : [null] extends [T]
  ? z.ZodNullable<toZod<NonNullable<T>>>
  : [undefined] extends [T]
  ? z.ZodOptional<toZod<NonNullable<T>>>
  : [T] extends [Schema]
  ? schemaTypeToZod<T>
  : [T] extends [Date]
  ? z.ZodDate
  : [T] extends [Array<infer E>]
  ? z.ZodArray<toZod<E>>
  : [T] extends [Set<infer E>]
  ? z.ZodSet<toZod<E>>
  : [T] extends [Map<infer K, infer V>]
  ? z.ZodMap<toZod<K>, toZod<V>>
  : [T] extends [PromiseLike<infer E>]
  ? z.ZodPromise<toZod<E>>
  : [T] extends [object]
  ? z.ZodObject<{ [k in keyof T]-?: NonNullable<toZod<T[k]>> }>
  : [number] extends [T]
  ? z.ZodNumber
  : [string] extends [T]
  ? z.ZodString
  : [boolean] extends [T]
  ? z.ZodBoolean
  : [bigint] extends [T]
  ? z.ZodBigInt
  : z.ZodType<output<T>, any, input<T>>;

type schemaTypeToZod<T extends Schema> = T extends {
  metadata: infer M extends object;
}
  ? z.ZodMetadata<toZod<Omit<T, "metadata">>, M>
  : T extends { [EffectsSymbol]: true; input: infer I; output: infer O }
  ? z.ZodEffects<toZod<I>, O, input<I>>
  : { input: string } extends T
  ? z.ZodString
  : { input: number } extends T
  ? z.ZodNumber
  : { input: boolean } extends T
  ? z.ZodBoolean
  : { input: bigint } extends T
  ? z.ZodBigInt
  : T extends { input: infer I }
  ? toZod<I>
  : z.ZodType<output<T>, any, input<T>>;

export const RefineSymbol = Symbol("Refine");

export abstract class Refine extends Effects {
  declare [RefineSymbol]: true;
  declare output: this["refine"] extends (value: any) => value is infer O
    ? O
    : never;
  abstract refine(value: output<this["input"]>): value is any;
  declare message?:
    | string
    | z.CustomErrorParams
    | ((arg: output<this["input"]>) => z.CustomErrorParams);
}

export const SuperRefineSymbol = Symbol("SuperRefine");

export abstract class SuperRefine extends Effects {
  declare [SuperRefineSymbol]: true;
  declare output: this["superRefine"] extends (value: any) => value is infer O
    ? O
    : never;
  abstract superRefine(
    value: output<this["input"]>,
    ctx: z.RefinementCtx
  ): value is any;
  declare message?:
    | string
    | z.CustomErrorParams
    | ((arg: output<this["input"]>) => z.CustomErrorParams);
}

type OptionalMessage<T> = T extends true ? true | string : T | [T, string];

type IPOptions =
  | true
  | string
  | {
      version?: "v4" | "v6";
      message?: string;
    };

type DateTimeOptions =
  | true
  | string
  | {
      precision?: number;
      offset?: true;
      message?: string;
    };

interface StringSchemaProps {
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

  // transformations
  trim?: true;
  toLowerCase?: true;
  toUpperCase?: true;
}

export const StringSchemaSymbol = Symbol("StringSchema");

export class StringSchema<
  Props extends StringSchemaProps
> extends EffectlessSchema {
  declare [StringSchemaSymbol]: true;
  declare input: string;
  declare props: Props;
}

interface NumberSchemaProps {
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

export const NumberSchemaSymbol = Symbol("NumberSchema");

export class NumberSchema<
  Props extends NumberSchemaProps
> extends EffectlessSchema {
  declare [NumberSchemaSymbol]: true;
  declare input: number;
  declare props: Props;
}

interface BigIntSchemaProps {
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

export const BigIntSchemaSymbol = Symbol("BigIntSchema");

export class BigIntSchema<
  Props extends BigIntSchemaProps
> extends EffectlessSchema {
  declare [BigIntSchemaSymbol]: true;
  declare input: bigint;
  declare props: Props;
}

interface DateSchemaProps {
  min?: OptionalMessage<string>;
  max?: OptionalMessage<string>;
}

export const DateSchemaSymbol = Symbol("DateSchema");

export class DateSchema<
  Props extends DateSchemaProps
> extends EffectlessSchema {
  declare [DateSchemaSymbol]: true;
  declare input: Date;
  declare props: Props;
}

interface ObjectSchemaProps {
  passthrough?: OptionalMessage<true>;
  strict?: OptionalMessage<true>;
  catchall?: any;
}

export const ObjectSchemaSymbol = Symbol("ObjectSchema");

export class ObjectSchema<
  T extends object,
  Props extends ObjectSchemaProps
> extends EffectlessSchema {
  declare [ObjectSchemaSymbol]: true;
  declare input: T;
  declare props: Props;
}

interface ArraySchemaProps {
  nonempty?: OptionalMessage<true>;

  min?: OptionalMessage<number>;
  max?: OptionalMessage<number>;
  length?: OptionalMessage<number>;
}

export const ArraySchemaSymbol = Symbol("ArraySchema");

export class ArraySchema<T, Props extends ArraySchemaProps> extends Schema {
  declare [ArraySchemaSymbol]: true;
  declare input: input<T>[];
  declare output: output<T>[];
  declare props: Props;
}

export const SetSchemaSymbol = Symbol("SetSchema");

type SetSchemaProps = ArraySchemaProps;

export class SetSchema<T, Props extends SetSchemaProps> extends Schema {
  declare [SetSchemaSymbol]: true;
  declare input: input<T>[];
  declare output: output<T>[];
  declare props: Props;
}

export class Includable<T> extends Transform {
  declare input: z.IncludableInput<input<T>>;
  declare transform: (
    value: output<z.IncludableInput<input<T>>>
  ) => z.IncludableOutput<output<T>>;
  declare metadata: { stainless: { includable: true } };
}

export class Includes<T, Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3> {
  declare input: IncludablePaths<output<T>, Depth>[];
  declare metadata: { stainless: { includes: true } };
}

export class Selectable<T> extends Transform {
  declare input: z.SelectableInput<input<T>>;
  declare transform: (
    value: output<z.SelectableInput<input<T>>>
  ) => z.SelectableOutput<output<T>>;
  declare metadata: { stainless: { selectable: true } };
}

export class Selects<T, Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3> {
  declare [TransformSymbol]: true;
  declare input: string;
  declare output: SelectTree | null | undefined;
  declare metadata: { stainless: { selects: true } };
}

interface PageResponseType<I> {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  items: I[];
}

const PageResponseSymbol = Symbol("PageResponse");

export class PageResponse<I> extends EffectlessSchema {
  declare [PageResponseSymbol]: true;
  declare item: I;
  declare input: PageResponseType<I>;
}
