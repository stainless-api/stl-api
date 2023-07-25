const SchemaSymbol = Symbol("Schema");

class Schema<O, I = O> {
  [SchemaSymbol] = true;
  declare input: I;
  declare output: O;

  // It would be nicer if we could have
  //
  //    declare transform: (value: I) => O | PromiseLike<O>
  //
  // but then if the extending class declares
  //
  //    transform(value: string): number { ... }
  //
  // it causes this TS error:
  //
  //    Class 'Schema<number, string>' defines instance member property 'transform',
  //     but extended class 'ParseNumber' defines it as instance member function.ts(2425)

  validate(value: I): void {}
  transform(value: I): O | PromiseLike<O> {
    return value as any;
  }

  declare maxLength?: O extends string ? number : never;
  declare max?: O extends number ? number : never;
}

class ShortString extends Schema<string> {
  maxLength = 5;
  // @ts-expect-error
  max = 100;
}

class SmallNumber extends Schema<number> {
  max = 100;
  // @ts-expect-error
  maxLength = 5;
}

class ParseNumber extends Schema<number, string> {
  // what if we want to constrain the length of the input?
  maxLength = 5;
  max = 100;
  transform(value: string) {
    return Number(value);
  }
}

abstract class PrismaModelLoader<O, I> extends Schema<O, I> {
  key: keyof O = "id" as any;
  declare abstract model: {
    findUniqueOrThrow(args: any): Promise<O>;
  };
}

type Post = {
  id: string;
  content: string;
};

const prismaPosts = {
  findUniqueOrThrow(args: any): Promise<Post> {
    return null as any;
  },
};

class PostType extends PrismaModelLoader<Post, string> {
  key = "content" as const; // we have to use `as const` if PrismaModelLoader constrains `key: keyof O`
  model = prismaPosts;
}
