import z from "zod";

export const TransformSymbol = Symbol("Transform");

export abstract class SchemaType<O, I> {
  declare _input: I;
  declare _output: O;
}

export abstract class Transform<O, I> extends SchemaType<O, I> {
  [TransformSymbol] = true;
  abstract transform(value: output<I>): O | PromiseLike<O>;
}

export const RefineSymbol = Symbol("Refine");

export abstract class Refine<I, O> extends Transform<O, I> {
  [RefineSymbol] = true;
  transform(value: output<I>): O {
    if (!this.refine(value)) {
      throw new Error("value is not the right type");
    }
    return value as O;
  }
  abstract refine(arg: output<I>): boolean;
}

export type input<T> = T extends SchemaType<any, infer I>
  ? input<I>
  : T extends Date
  ? Date
  : T extends object
  ? { [k in keyof T]: input<T[k]> }
  : T extends Array<infer E>
  ? Array<input<E>>
  : T extends Set<infer E>
  ? Set<input<E>>
  : T extends PromiseLike<infer E>
  ? PromiseLike<input<E>>
  : T;
export type output<T> = T extends SchemaType<infer O, any>
  ? output<O>
  : T extends Date
  ? Date
  : T extends object
  ? { [k in keyof T]: output<T[k]> }
  : T extends Array<infer E>
  ? Array<output<E>>
  : T extends Set<infer E>
  ? Set<output<E>>
  : T extends PromiseLike<infer E>
  ? PromiseLike<output<E>>
  : T;

export type TypeSchema<Output, Input = any> =
  | Output
  | SchemaType<Output, Input>;

export type toZod<T> = z.ZodType<output<T>, z.ZodTypeDef, input<T>>;

class ParseFloat<I extends TypeSchema<string>> extends Transform<number, I> {
  transform(value: output<I>): number {
    return parseFloat(value);
  }
}

class ToString<I> extends Transform<string, I> {
  transform(value: output<I>): string {
    return String(value);
  }
}

type HttpPath = `/${string}`;

const httpPathSchema = z
  .string()
  .refine((value): value is HttpPath => value.startsWith("/"));
type inp = z.input<typeof httpPathSchema>;
type out = z.output<typeof httpPathSchema>;

class ToHttpPath<I extends TypeSchema<string>> extends Refine<I, HttpPath> {
  refine(value: output<I>): boolean {
    return value.startsWith("/");
  }
}

class ToDate<I extends TypeSchema<string | number | Date>> extends Transform<
  Date,
  I
> {
  transform(value: output<I>): Date {
    return new Date(value);
  }
}

class ToBigInt<
  I extends TypeSchema<string | number | bigint | boolean>
> extends Transform<bigint, I> {
  async transform(value: output<I>): Promise<bigint> {
    return BigInt(value);
  }
}

type Schema = {
  a: ToBigInt<ToString<ParseFloat<string>>> | null;
  b?: ToHttpPath<ToString<number>>;
};

const parseFloatInstance = new ParseFloat();
const toStringInstance = new ToString();
const toBigIntInstance = new ToBigInt();
const toHttpPathInstance = new ToHttpPath();

const genZodSchema: toZod<Schema> = z.object({
  a: z
    .string()
    .transform(parseFloatInstance.transform)
    .transform(toStringInstance.transform)
    .transform(toBigIntInstance.transform)
    .nullable(),
  b: z
    .number()
    .transform(toStringInstance.transform)
    .transform(toHttpPathInstance.transform)
    .optional(),
});

type ZodInput = z.input<typeof genZodSchema>;
type ZodOutput = z.output<typeof genZodSchema>;

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
