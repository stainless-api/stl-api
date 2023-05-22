import { inspect } from "util";

export function logged<T>(t: T): T {
  console.log(inspect(t, { depth: 5 }));
  return t;
}
