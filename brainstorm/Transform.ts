import z from "zod";

export const TransformSymbol = Symbol("Transform");

export abstract class Transform<O, I> {
  [TransformSymbol] = true;
  abstract transform(value: input<I>): output<O>;
}

export type input<T> = T extends Transform<any, infer I>
  ? input<I>
  : T extends Date
  ? Date
  : T extends object
  ? { [k in keyof T]: input<T[k]> }
  : T extends Array<infer E>
  ? Array<input<E>>
  : T extends Set<infer E>
  ? Set<input<E>>
  : T extends Promise<infer E>
  ? Promise<input<E>>
  : T;
export type output<T> = T extends Transform<infer O, any>
  ? output<O>
  : T extends Date
  ? Date
  : T extends object
  ? { [k in keyof T]: output<T[k]> }
  : T extends Array<infer E>
  ? Array<output<E>>
  : T extends Set<infer E>
  ? Set<output<E>>
  : T extends Promise<infer E>
  ? Promise<output<E>>
  : T;

export type TypeSchema<T> = T | Transform<T, any>;

export type toZod<T> = z.ZodType<output<T>, z.ZodTypeDef, input<T>>;

class ParseFloat<I extends TypeSchema<string> = string> extends Transform<
  number,
  I
> {
  transform(value: input<I>): number {
    return parseFloat(value);
  }
}

class ToString<I = unknown> extends Transform<string, I> {
  transform(value: input<I>): string {
    return String(value);
  }
}

class ToDate<I extends TypeSchema<string | number | Date>> extends Transform<
  Date,
  I
> {
  transform(value: input<I>): Date {
    return new Date(value);
  }
}

class ToBigInt<
  I extends TypeSchema<string | number | bigint | boolean> =
    | string
    | number
    | bigint
    | boolean
> extends Transform<bigint, I> {
  transform(value: input<I>): bigint {
    return BigInt(value);
  }
}

type Schema = {
  a: ToBigInt<ToString<ParseFloat>> | null;
  b?: string;
};

type SchemaInput = input<Schema>;
type SchemaOutput = output<Schema>;
type SchemaZod = toZod<Schema>;

type BadSchema = {
  a: ToBigInt<
    // @ts-expect-error can't input Date to ToBigInt
    ToDate<ParseFloat>
  > | null;
  b?: string;
};
