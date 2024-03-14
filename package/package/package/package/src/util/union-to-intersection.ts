// Ref: https://fettblog.eu/typescript-union-to-intersection/
export type UnionToIntersection<T> = (
  T extends any ? (x: T) => any : never
) extends (x: infer R) => any
  ? R
  : never;
