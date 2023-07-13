import * as z from "./z";

export const SchemaSymbol = Symbol("SchemaType");

export abstract class SchemaType<I, O = I> {
  [SchemaSymbol] = true;
  declare _input: I;
  declare _output: O;
}

export const MetadataSymbol = Symbol("Metadata");

export abstract class Metadata<T, M extends object> extends SchemaType<T> {
  [MetadataSymbol] = true;
  declare _metadata: M;
}

export const TransformSymbol = Symbol("Transform");

export abstract class Transform<I, O> extends SchemaType<I, O> {
  [TransformSymbol] = true;
  abstract transform(
    value: output<I>,
    ctx: z.RefinementCtx
  ): O | PromiseLike<O>;
}

export type input<T> = 0 extends 1 & T
  ? any
  : T extends SchemaType<infer I, any>
  ? input<I>
  : T extends z.ZodTypeAny
  ? z.input<T>
  : T extends Date
  ? Date
  : T extends object
  ? { [k in keyof T]: input<T[k]> }
  : T extends Array<infer E>
  ? Array<input<E>>
  : T extends Set<infer E>
  ? Set<input<E>>
  : T extends Map<infer K, infer V>
  ? Map<input<K>, input<V>>
  : T extends PromiseLike<infer E>
  ? PromiseLike<input<E>>
  : T;

export type output<T> = 0 extends 1 & T
  ? any
  : T extends SchemaType<any, infer O>
  ? output<O>
  : T extends z.ZodTypeAny
  ? z.output<T>
  : T extends Date
  ? Date
  : T extends object
  ? { [k in keyof T]: output<T[k]> }
  : T extends Array<infer E>
  ? Array<output<E>>
  : T extends Set<infer E>
  ? Set<output<E>>
  : T extends Map<infer K, infer V>
  ? Map<output<K>, output<V>>
  : T extends PromiseLike<infer E>
  ? PromiseLike<output<E>>
  : T;

export type TypeSchema<Output> = Output | SchemaType<any, Output>;

export type toZod<T> = [T] extends [z.ZodTypeAny]
  ? T
  : [null | undefined] extends [T]
  ? z.ZodOptional<z.ZodNullable<toZod<NonNullable<T>>>>
  : [null] extends [T]
  ? z.ZodNullable<toZod<NonNullable<T>>>
  : [undefined] extends [T]
  ? z.ZodOptional<toZod<NonNullable<T>>>
  : // : T extends Transform<infer I, infer O>
  // ? z.ZodEffects<toZod<I>, output<O>, input<I>>
  // : T extends Refine<infer I, infer O>
  // ? z.ZodEffects<toZod<I>, output<O>, input<I>>
  // : T extends SuperRefine<infer I, infer O>
  // ? z.ZodEffects<toZod<I>, output<O>, input<I>>
  [T] extends [Metadata<infer U, infer M>]
  ? z.ZodMetadata<toZod<U>, M>
  : [T] extends [StringSchema<any>]
  ? z.ZodString
  : [T] extends [NumberSchema<any>]
  ? z.ZodNumber
  : [T] extends [BigIntSchema<any>]
  ? z.ZodBigInt
  : [T] extends [DateSchema<any>]
  ? z.ZodDate
  : [T] extends [ObjectSchema<infer Shape, any>]
  ? z.ZodObject<{ [k in keyof Shape]-?: NonNullable<toZod<Shape[k]>> }>
  : [T] extends [ArraySchema<infer E, any>]
  ? z.ZodArray<toZod<E>>
  : [T] extends [SetSchema<infer E, any>]
  ? z.ZodSet<toZod<E>>
  : [T] extends [Includable<infer U>]
  ? z.IncludableZodType<toZod<U>>
  : [T] extends [Selectable<infer U>]
  ? z.SelectableZodType<toZod<U>>
  : [T] extends [SchemaType<infer I, infer O>]
  ? z.ZodType<output<O>, any, input<I>>
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
  : z.ZodType<output<T>, any, input<T>>;

export const RefineSymbol = Symbol("Refine");

export abstract class Refine<I, RO = output<I>> extends SchemaType<I, RO> {
  [RefineSymbol] = true;
  message:
    | string
    | z.CustomErrorParams
    | ((arg: output<I>) => z.CustomErrorParams)
    | undefined = undefined;

  abstract refine(value: output<I>): unknown | Promise<unknown>;
}

export const SuperRefineSymbol = Symbol("SuperRefine");

export abstract class SuperRefine<I, RO = output<I>> extends SchemaType<I, RO> {
  [SuperRefineSymbol] = true;
  abstract superRefine(value: output<I>, ctx: z.RefinementCtx): void;
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

export class StringSchema<Props extends StringSchemaProps> extends SchemaType<
  string,
  string
> {}

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

export class NumberSchema<Props extends NumberSchemaProps> extends SchemaType<
  number,
  number
> {}

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

export class BigIntSchema<Props extends BigIntSchemaProps> extends SchemaType<
  bigint,
  bigint
> {}

interface DateSchemaProps {
  min?: OptionalMessage<string>;
  max?: OptionalMessage<string>;
}

export class DateSchema<Props extends DateSchemaProps> extends SchemaType<
  number,
  number
> {}

interface ObjectSchemaProps {
  passthrough?: OptionalMessage<true>;
  strict?: OptionalMessage<true>;
  catchall?: any;
}

export class ObjectSchema<
  T extends object,
  Props extends ObjectSchemaProps
> extends SchemaType<T, T> {}

interface ArraySchemaProps {
  nonempty?: OptionalMessage<true>;

  min?: OptionalMessage<number>;
  max?: OptionalMessage<number>;
  length?: OptionalMessage<number>;
}

export class ArraySchema<T, Props extends ArraySchemaProps> extends SchemaType<
  T[],
  T[]
> {}

type SetSchemaProps = ArraySchemaProps;

export class SetSchema<T, Props extends SetSchemaProps> extends SchemaType<
  Set<T>,
  Set<T>
> {}
import { IncludablePaths } from "./includes";
import { SelectTree } from "./parseSelect";

export class Includable<T extends TypeSchema<any>> extends Metadata<
  SchemaType<z.IncludableInput<input<T>>, z.IncludableOutput<output<T>>>,
  { stainless: { includable: true } }
> {}

export class Includes<
  T,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3
> extends Metadata<
  IncludablePaths<output<T>, Depth>[],
  { stainless: { includes: true } }
> {}

export class Selectable<T extends TypeSchema<any>> extends Metadata<
  SchemaType<z.SelectableInput<input<T>>, z.SelectableOutput<output<T>>>,
  { stainless: { selectable: true } }
> {}

export class Selects<
  T extends TypeSchema<object>,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3
> extends Metadata<
  SchemaType<string, SelectTree | null | undefined>,
  { stainless: { selects: true } }
> {}

export class Selection<T extends TypeSchema<any>> extends SchemaType<
  input<T>,
  output<T>
> {}

interface PageResponseType<I> {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  items: I[];
}

export class PageResponse<I extends TypeSchema<any>> extends SchemaType<
  PageResponseType<I>
> {}
