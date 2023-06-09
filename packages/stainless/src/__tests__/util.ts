type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <
  V
>() => V extends U ? 1 : 2
  ? true
  : false;

export const assertEqual = <A, B>(val: AssertEqual<A, B>) => val;
