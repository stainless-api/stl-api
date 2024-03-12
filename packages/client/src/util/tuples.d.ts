export type Shift<T extends any[]> = T extends [T[0], ...infer R] ? R : never;

export type SplitHeadAndTail<T extends any[]> = T extends [T[0], ...infer R]
  ? [T[0], R]
  : never;

export type Filter<T extends readonly any[], E> = T extends [
  infer F,
  ...infer R
]
  ? [F] extends [E]
    ? Filter<R, E>
    : [F, ...Filter<R, E>]
  : [];

export type Recurse<
  Tuple extends string[],
  H = Tuple[0],
  T = SplitHeadAndTail<Tuple>[1]
> = T extends [T[0], ...infer R]
  ? {
      [key: T[0]];
    }
  : never;

// H extends never ? '':
//  T extends never ? {} : Record<H, Recurse<T>>;

type Recursion<T> = keyof {
  [Property in keyof T]: T[Property] extends string | number | boolean | null
    ? Property
    : { [key: "123"]: Recursion<T[Property]> };
};

type f = Recursion<{
  a: {
    b: {
      c: {
        d: {
          test: 123;
        };
      };
    };
  };
}>;

type MakeCallable<P extends unknown[], H = P[0]> = P extends [H, ...infer R]
  ? { [key in string & H]: MakeCallable<R> }
  : () => {};
