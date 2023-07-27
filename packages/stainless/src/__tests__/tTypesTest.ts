import * as z from "../z";

export const PrismaModelSymbol = Symbol("PrismaModel");

type MakePrismaModelMetadata<M> = { stainless: { prismaModel: M } };

interface PrismaHelpers {
  findUniqueOrThrow(args: any): Promise<any>;
}

export abstract class PrismaModel extends z.EffectlessSchema {
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

export abstract class PrismaModelLoader extends z.Effects {
  declare [PrismaModelLoaderSymbol]: true;
  declare output: FindUniqueOrThrowResult<this["model"]>;
  declare abstract model: PrismaHelpers;
}

type PathString = `/${string}`;

export class PathStringSchema<I extends string = string> extends z.Refine {
  declare input: I;
  refine(value: string): value is PathString {
    return value.startsWith("/");
  }
}

type P = {
  s: PathStringSchema;
};

type Pinput = z.In<P>;
type Poutput = z.Out<P>;

type A = { a: 1 } | null | undefined;
type B<T> = T extends object ? { [k in keyof T]: T[k] } : T;
type C = B<A>;

type Post = {
  id: string;
  body: string;
  user?: z.Includable<User>;
  comments?: z.Includable<Comment[]>;
};

type Comment = {
  id: string;
  body: string;
  user?: z.Includable<User>;
  post?: z.Includable<Post>;
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
    posts: z.Includable<Post[]>;
    comments?: z.Includable<Comment[]>;
  };
  model = prismaUser;
}

type Q = z.toZod<z.Includable<Post[]> | undefined>;

type UserInput = z.In<User>;
type UserOutput = z.Out<User["input"]>;
type UserZod = z.toZod<User>;
type UserZodInput = z.input<UserZod>;
type UserZodOutput = z.output<UserZod>;

type UserZodPrisma = z.extractDeepMetadata<
  UserZod,
  { stainless: { prismaModel: {} } }
>;

class ToString<Input = any> extends z.Transform {
  declare input: Input;
  transform(value: z.Out<Input>): string {
    return String(value);
  }
}

class ParseNumber<Input = string> extends z.Transform {
  declare input: Input;
  transform(value: z.Out<Input>): number {
    return Number(value);
  }
}

class ShortString extends z.EffectlessSchema implements z.StringSchemaProps {
  declare input: string;
  max = 5;
}

type X = {
  a: ParseNumber<ToString<Date>>;
  b: number;
  c: z.Metadata<1 | 2, { stainless: { test: true } }>;
  d: ShortString;
  include: z.Includes<Post, 4>;
  userId: UserId;
  user: User;
};

type Xinput = z.In<X>;
type Xoutput = z.Out<X>;

type Xzod = z.toZod<X>;
type XzodInput = z.input<Xzod>;
type XzodOutput = z.output<Xzod>;
