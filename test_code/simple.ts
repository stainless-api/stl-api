export interface A {}

export type Conditional = { a: 1 } & { b: 2 };

export type StringOrNumber = Promise<string>;
//   | number
//   | string
// | "a"
// | 1
// | 3n
// | true
// | false
// | ({ a: number } & { a: number })
// | number[]
// | [number, string];
//   | ("foo" extends string ? boolean : never);
//

type T = Array<number> | number[] | ReadonlyArray<number> | readonly number[];

export interface Base {}

export interface Derived extends Base {}
