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
