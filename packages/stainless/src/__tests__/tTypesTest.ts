import * as t from "../t";
import * as z from "../z";

export const PrismaModelSymbol = Symbol("PrismaModel");

type MakePrismaModelMetadata<M> = { stainless: { prismaModel: M } };

interface PrismaHelpers {
  findUniqueOrThrow(args: any): Promise<any>;
}

export abstract class PrismaModel extends t.EffectlessSchema {
  declare [PrismaModelSymbol]: true;
  declare abstract model: PrismaHelpers;
  declare metadata: MakePrismaModelMetadata<this["model"]>;
}

export const PrismaModelLoaderSymbol = Symbol("PrismaModelLoader");

type FindUniqueOrThrowResult<D extends PrismaHelpers> = D extends {
  findUniqueOrThrow: (args: any) => Promise<infer Result>;
}
  ? Result
  : never;

export abstract class PrismaModelLoader extends t.Effects {
  declare [PrismaModelLoaderSymbol]: true;
  declare output: FindUniqueOrThrowResult<this["model"]>;
  declare abstract model: PrismaHelpers;
}

type PathString = `/${string}`;

export class PathStringSchema<I extends string = string> extends t.Refine {
  declare input: I;
  refine(value: string): value is PathString {
    return value.startsWith("/");
  }
}

type P = {
  s: PathStringSchema;
};

type A = { a: 1 } | null | undefined;
type B<T> = T extends object ? { [k in keyof T]: T[k] } : T;
type C = B<A>;

type Pinput = t.input<P>;
type Poutput = t.output<P>;

type Post = {
  id: string;
  body: string;
  user?: t.Includable<User>;
  comments?: t.Includable<Comment[]>;
};

type Comment = {
  id: string;
  body: string;
  user?: t.Includable<User>;
  post?: t.Includable<Post>;
};

export function prismaModel<M>(model: M) {
  return { stainless: { prismaModel: model } };
}

const prismaUser = {
  findUniqueOrThrow(args: any): Promise<{ id: string; email: string }> {
    return null as any;
  },
};

class UserId extends PrismaModelLoader {
  declare input: string;
  model = prismaUser;
}

class User extends PrismaModel {
  declare input: {
    id: string;
    email: string;
    posts: t.Includable<Post[]>;
    comments?: t.Includable<Comment[]>;
  };
  model = prismaUser;
}

type Q = t.toZod<t.Includable<Post[]> | undefined>;

type UserInput = t.input<User>;
type UserOutput = t.output<User["input"]>;
type UserZod = t.toZod<User>;
type UserZodInput = z.input<UserZod>;
type UserZodOutput = z.output<UserZod>;

type UserZodPrisma = z.extractDeepMetadata<
  UserZod,
  { stainless: { prismaModel: {} } }
>;

class ToString<Input = any> extends t.Transform {
  declare input: Input;
  transform(value: t.output<Input>): string {
    return String(value);
  }
}

class ParseNumber<Input = string> extends t.Transform {
  declare input: Input;
  transform(value: t.output<Input>): number {
    return Number(value);
  }
}

class ShortString extends t.EffectlessSchema implements t.StringSchemaProps {
  declare input: string;
  max = 5;
}

type X = {
  a: ParseNumber<ToString<Date>>;
  b: number;
  c: t.Metadata<1 | 2, { stainless: { test: true } }>;
  d: ShortString;
  include: t.Includes<Post, 4>;
  userId: UserId;
  user: User;
};

type Xinput = t.input<X>;
type Xoutput = t.output<X>;

type Xzod = t.toZod<X>;
type XzodInput = z.input<Xzod>;
type XzodOutput = z.output<Xzod>;
