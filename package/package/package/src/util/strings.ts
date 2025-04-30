export type Replace<
  Input extends string,
  Search extends string,
  Replacement extends string
> = Input extends `${infer Start}${Search}${infer End}`
  ? `${Replace<Start, Search, Replacement>}${Replacement}${Replace<
      End,
      Search,
      Replacement
    >}`
  : Input;

export type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : S extends `${infer P1}-${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

// TODO(someday): pull in a lib to cover more edge cases
export const camelCase = (str: string) =>
  str.replace(/-./g, (x) => x[1].toUpperCase());

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export function kebabCase(str: string) {
  return str
    .split("")
    .map((letter, idx) => {
      return letter.toLowerCase() === letter
        ? letter
        : `${idx !== 0 ? "-" : ""}${letter.toLowerCase()}`;
    })
    .join("");
}
