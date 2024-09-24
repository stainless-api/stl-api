import * as z from "../z";

export const PrismaModelSymbol = Symbol("PrismaModel");

type MakePrismaModelMetadata<M> = { stainless: { prismaModel: M } };

interface PrismaHelpers {
  findUniqueOrThrow(args: any): Promise<any>;
}

export abstract class PrismaModel<O> extends z.Schema<O> {
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

export abstract class PrismaModelLoader<O, I> extends z.Schema<O, I> {
  declare [PrismaModelLoaderSymbol]: true;
  declare abstract model: PrismaHelpers & {
    findUniqueOrThrow(args: any): Promise<O>;
  };
}

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

type PrismaUser = { id: string; email: string };

const prisma = {
  user: {
    findUniqueOrThrow(args: any): Promise<PrismaUser> {
      return null as any;
    },
  },
};

class UserId extends PrismaModelLoader<PrismaUser, string> {
  model = prisma.user;
}

class User extends PrismaModel<{
  id: string;
  email: string;
  posts: z.Includable<Post[]>;
  comments?: z.Includable<Comment[]>;
}> {
  model = prisma.user;
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
