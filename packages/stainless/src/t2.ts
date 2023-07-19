import { IncludablePaths } from "./includes";
import { z } from "./stl";

export const SchemaSymbol = Symbol("SchemaType");

export abstract class Schema {
  [SchemaSymbol] = true;
}

export abstract class Transform<I, O> extends Schema {
  declare input: I;
  declare output: O;
  abstract transform(value: output<I>): O | PromiseLike<O>;
}

class ToString<Input = any> extends Transform<Input, string> {
  transform(value: output<Input>): string {
    return String(value);
  }
}

class ParseNumber<Input = string> extends Transform<Input, number> {
  transform(value: output<Input>): number {
    return Number(value);
  }
}

class ShortString extends Schema {
  declare input: string;
  maxLength = 5;
}

export type input<T> = 0 extends 1 & T
  ? any
  : T extends Schema
  ? schemaTypeInput<T>
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

const ERROR = Symbol("ERROR");

type schemaTypeInput<T extends Schema> = T extends { input: infer I }
  ? input<I>
  : T extends { transform: (value: infer I) => any }
  ? input<I>
  : { [ERROR]: "unable to determine schema input type"; schema: T };

export type output<T> = 0 extends 1 & T
  ? any
  : T extends Schema
  ? schemaTypeOutput<T>
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

type UnwrapPromise<T> = T extends PromiseLike<infer V> ? V : T;

type schemaTypeOutput<T extends Schema> = T extends { output: infer O }
  ? output<O>
  : T extends {
      transform: (value: any) => infer O;
    }
  ? UnwrapPromise<O>
  : T extends { input: infer I }
  ? output<I>
  : { [ERROR]: "unable to determine schema output type"; schema: T };

export type toZod<T> = [T] extends [z.ZodTypeAny]
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

interface MetadataProps {
  // extension from @stl-api/prisma
  prismaModel: object;
}

type schemaTypeToZod<T extends Schema> = T extends {
  metadata: infer M extends object;
}
  ? z.ZodMetadata<toZod<Omit<T, "metadata">>, M>
  : T extends { input: infer I; transform: (value: any) => infer O }
  ? z.ZodEffects<toZod<I>, O, input<I>>
  : T extends { transform: (value: infer I) => infer O }
  ? z.ZodEffects<toZod<I>, O, I>
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

export class Metadata<Input, Metadata extends object> extends Schema {
  declare input: Input;
  declare metadata: Metadata;
}

export class Includable<T> extends Metadata<
  Transform<z.IncludableInput<input<T>>, z.IncludableOutput<output<T>>>,
  { stainless: { includable: true } }
> {}

export class Includes<
  T,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3
> extends Metadata<
  IncludablePaths<output<T>, Depth>[],
  { stainless: { includes: true } }
> {}

const prismaFoo = Symbol("prisma.foo");

class MyModel extends Schema {
  declare input: { id: string };
  metadata = prismaModel(prismaFoo);
}

type MyModelZod = toZod<MyModel>;
type MyModelPrismaModel = z.extractDeepMetadata<
  MyModelZod,
  { stainless: { prismaModel: {} } }
>;

type Post = {
  id: string;
  body: string;
  user?: Includable<User>;
  comments?: Includable<Comment[]>;
};

type Comment = {
  id: string;
  body: string;
  user?: Includable<User>;
  post?: Includable<Post>;
};

export function prismaModel<M>(model: M) {
  return { stainless: { prismaModel: model } };
}

const prismaUser = Symbol("prisma.user");

class User extends Schema {
  declare input: {
    id: string;
    email: string;
    posts?: Includable<Post[]>;
    comments?: Includable<Comment[]>;
  };
  metadata = prismaModel(prismaUser);
}

type UserZod = toZod<User>;

type X = {
  a: ParseNumber<ToString<Date>>;
  b: number;
  c: Metadata<1 | 2, { stainless: { test: true } }>;
  d: ShortString;
  include: Includes<Post>;
  user: User;
};

type Xinput = input<X>;
type Xoutput = output<X>;

type Xzod = toZod<X>;
type XzodInput = z.input<Xzod>;
type XzodOutput = z.output<Xzod>;
