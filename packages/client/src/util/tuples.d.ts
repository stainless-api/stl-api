export type Shift<T extends any[]> = T extends [T[0], ...infer R] ? R : never;

export type SplitHeadAndTail<T extends any[]> = T extends [T[0], ...infer R]
  ? [T[0], R]
  : never;
