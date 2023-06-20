import z from "zod";

export abstract class SchemaType<I, O> {
  declare _input: I;
  declare _output: O;
}

export const TransformSymbol = Symbol("Transform");

export abstract class Transform<I, O> extends SchemaType<I, O> {
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

export type TypeSchema<Output> =
  | Output
  | SchemaType<any, Output>;

export type toZod<T> = z.ZodType<output<T>, z.ZodTypeDef, input<T>>;

export const RefineSymbol = Symbol("Refine");

export abstract class Refine<I, RO = output<I>> extends SchemaType<I, RO> {
  [RefineSymbol] = true;
  message: string | z.CustomErrorParams | ((arg: output<I>) => z.CustomErrorParams) | undefined = undefined;

  abstract refine(value: output<I>): unknown | Promise<unknown> ;
}

export const SuperRefineSymbol = Symbol("SuperRefine");

export abstract class SuperRefine<I, RO = output<I>> extends SchemaType<I, RO> {
  [SuperRefineSymbol] = true;
  abstract superRefine(value: output<I>, ctx: z.RefinementCtx): void;
}
