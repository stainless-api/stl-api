import z from "zod";

export abstract class SchemaType<O, I> {
  declare _input: I;
  declare _output: O;
}

export const TransformSymbol = Symbol("Transform");

export abstract class Transform<O, I> extends SchemaType<O, I> {
  [TransformSymbol] = true;
  abstract transform(
    value: output<I>,
    ctx: z.RefinementCtx
  ): O | PromiseLike<O>;
}

export type input<T> = any extends T
  ? any
  : T extends SchemaType<any, infer I>
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

export type output<T> = any extends T
  ? any
  : T extends SchemaType<any, infer I>
  ? output<I>
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

export type TypeSchema<Output, Input = any> =
  | Output
  | SchemaType<Output, Input>;

export type toZod<T> = z.ZodType<output<T>, z.ZodTypeDef, input<T>>;
