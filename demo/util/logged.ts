export function logged<T>(t: T): T {
  console.error(t);
  return t;
}
