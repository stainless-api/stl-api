const CustomTypeSymbol = Symbol("custom");

abstract class Transform<O, I> {
  [CustomTypeSymbol] = true;
  abstract transform(value: input<I>): output<O>;
}

type input<T> = T extends Transform<any, infer I>
  ? input<I>
  : T extends object
  ? { [k in keyof T]: input<T[k]> }
  : T extends Array<infer E>
  ? Array<input<E>>
  : T extends Set<infer E>
  ? Set<input<E>>
  : T extends Promise<infer E>
  ? Promise<input<E>>
  : T;
type output<T> = T extends Transform<infer O, any>
  ? output<O>
  : T extends object
  ? { [k in keyof T]: output<T[k]> }
  : T extends Array<infer E>
  ? Array<output<E>>
  : T extends Set<infer E>
  ? Set<output<E>>
  : T extends Promise<infer E>
  ? Promise<output<E>>
  : T;

class ParseFloat<I extends string = string> extends Transform<number, I> {
  transform(value: string): number {
    return parseFloat(value);
  }
}

class ToString<I> extends Transform<string, I> {
  transform(value: input<I>): string {
    return String(value);
  }
}

class ToBigInt<I = number> extends Transform<bigint, I> {
  transform(value: input<I>): bigint {
    return BigInt(value as any);
  }
}

type Schema = {
  a: ToBigInt<ParseFloat>;
  b?: string;
};

type SchemaInput = input<Schema>;
type SchemaOutput = output<Schema>;
