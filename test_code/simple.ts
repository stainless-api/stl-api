export interface A {}

export type Obj = { a: 1; b: "foo" };
export type Mapped = { [K in keyof Obj]: { value: Obj[K] } };

export type T =
  // | Mapped
  // | number
  // | string
  // | "a"
  // | 1
  // | 3n
  // | true
  // | false
  // | ({ a: number } & { a: number })
  // | number[]
  // | [number, string]
  {
    [K in keyof Obj]: Obj[K] extends string
      ? { string: Obj[K] }
      : { other: Obj[K] };
  };
//

export interface Base {}

export interface Derived extends Base {}
