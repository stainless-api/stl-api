import { IncludablePaths } from "./includes";
import { SelectTree, z, StlContext } from "./stl";

export const SchemaSymbol = Symbol("SchemaType");

export abstract class BaseSchema {
  declare [SchemaSymbol]: true;
  declare abstract input: any;
  declare abstract output: any;
  declare metadata?: object;
}

export class Schema<O, I = O> extends BaseSchema {
  declare input: I;
  declare output: O;
  validate(value: output<I>, ctx: StlContext<any>): void {}
  transform(
    value: output<I>,
    ctx: StlContext<any>,
    zodInput: z.ParseInput
  ): output<O> | PromiseLike<output<O>> {
    return value as any;
  }
}

export type SchemaInput<I> = I | Schema<I, any>;

export const EffectlessSchemaSymbol = Symbol("EffectlessSchema");

export class Metadata<O, Metadata extends object> extends Schema<O> {
  declare metadata: Metadata;
}
export const EffectsSymbol = Symbol("Effects");

export const TransformSymbol = Symbol("Transform");

export type input<T> = 0 extends 1 & T
  ? any
  : T extends BaseSchema
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
  : T extends BaseSchema
  ? output<T["output"]>
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

export type toZod<T> = 0 extends 1 & T
  ? any
  : [null | undefined] extends [T]
  ? z.ZodOptional<z.ZodNullable<toZod<NonNullable<T>>>>
  : [null] extends [T]
  ? z.ZodNullable<toZod<NonNullable<T>>>
  : [undefined] extends [T]
  ? z.ZodOptional<toZod<NonNullable<T>>>
  : [T] extends [z.ZodTypeAny]
  ? T
  : [T] extends [BaseSchema]
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
  ? z.ZodObject<{ [k in keyof T]-?: toZod<T[k]> }>
  : [number] extends [T]
  ? z.ZodNumber
  : [string] extends [T]
  ? z.ZodString
  : [boolean] extends [T]
  ? z.ZodBoolean
  : [bigint] extends [T]
  ? z.ZodBigInt
  : z.ZodType<output<T>, any, input<T>>;

type schemaTypeToZod<T extends BaseSchema> = T extends {
  metadata: infer M extends object;
}
  ? z.ZodMetadata<toZod<Omit<T, "metadata">>, M>
  : T extends {
      [IncludableSymbol]: true;
      includable: infer I;
    }
  ? z.ZodEffects<
      toZod<I>,
      z.IncludableOutput<output<I>>,
      z.IncludableInput<input<I>>
    >
  : T extends { [EffectsSymbol]: true; input: infer I; output: infer O }
  ? z.ZodEffects<toZod<I>, output<O>, input<I>>
  : toZod<T["input"]>;

export type OptionalMessage<T> = T extends true
  ? true | string
  : T | [T, string];

export type IPOptions =
  | true
  | string
  | {
      version?: "v4" | "v6";
      message?: string;
    };

export type DateTimeOptions =
  | true
  | string
  | {
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

  // transformations
  trim?: true;
  toLowerCase?: true;
  toUpperCase?: true;
}

export const StringSchemaSymbol = Symbol("StringSchema");

export class StringSchema<
  Props extends StringSchemaProps
> extends Schema<string> {
  declare [StringSchemaSymbol]: true;
  declare input: string;
  declare props: Props;
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

export const NumberSchemaSymbol = Symbol("NumberSchema");

export class NumberSchema<
  Props extends NumberSchemaProps
> extends Schema<number> {
  declare [NumberSchemaSymbol]: true;
  declare input: number;
  declare props: Props;
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

export const BigIntSchemaSymbol = Symbol("BigIntSchema");

export class BigIntSchema<
  Props extends BigIntSchemaProps
> extends Schema<bigint> {
  declare [BigIntSchemaSymbol]: true;
  declare input: bigint;
  declare props: Props;
}

export interface DateSchemaProps {
  min?: OptionalMessage<string>;
  max?: OptionalMessage<string>;
}

export const DateSchemaSymbol = Symbol("DateSchema");

export class DateSchema<Props extends DateSchemaProps> extends Schema<Date> {
  declare [DateSchemaSymbol]: true;
  declare input: Date;
  declare props: Props;
}

export interface ObjectSchemaProps {
  passthrough?: OptionalMessage<true>;
  strict?: OptionalMessage<true>;
  catchall?: any;
}

export const ObjectSchemaSymbol = Symbol("ObjectSchema");

export class ObjectSchema<
  T extends object,
  Props extends ObjectSchemaProps
> extends Schema<T> {
  declare [ObjectSchemaSymbol]: true;
  declare props: Props;
}

export interface ArraySchemaProps {
  nonempty?: OptionalMessage<true>;

  min?: OptionalMessage<number>;
  max?: OptionalMessage<number>;
  length?: OptionalMessage<number>;
}

export const ArraySchemaSymbol = Symbol("ArraySchema");

export class ArraySchema<T, Props extends ArraySchemaProps> extends Schema<
  T[]
> {
  declare [ArraySchemaSymbol]: true;
  declare props: Props;
}

export const SetSchemaSymbol = Symbol("SetSchema");

type SetSchemaProps = ArraySchemaProps;

export class SetSchema<T, Props extends SetSchemaProps> extends Schema<Set<T>> {
  declare [SetSchemaSymbol]: true;
  declare props: Props;
}

export const IncludableSymbol = Symbol("Includable");

export class Includable<T> extends Schema<
  z.IncludableOutput<output<T>>,
  z.IncludableInput<input<T>>
> {
  declare [IncludableSymbol]: true;
  declare includable: T;
  declare metadata: { stainless: { includable: true } };
}

export class Includes<
  T,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3
> extends Schema<IncludablePaths<output<T>, Depth>[], string> {
  declare metadata: { stainless: { includes: true } };
}

export const SelectableSymbol = Symbol("Selectable");

export class Selectable<T> extends Schema<
  z.SelectableOutput<output<T>>,
  z.SelectableInput<input<T>>
> {
  declare [SelectableSymbol]: true;
  declare selectable: T;
  declare metadata: { stainless: { selectable: true } };
}

export class Selects<T, Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3> extends Schema<
  SelectTree | null | undefined,
  string
> {
  declare [EffectsSymbol]: true;
  declare metadata: { stainless: { selects: true } };
}

export class Selection<T extends SchemaInput<any>> extends Schema<T> {}

export interface PageResponseType<I> {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  items: I[];
}

const PageResponseSymbol = Symbol("PageResponse");

export class PageResponse<I> extends Schema<PageResponseType<I>> {
  declare [PageResponseSymbol]: true;
  declare item: I;
}
