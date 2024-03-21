// TODO(someday): pull in a lib to cover more edge cases
export const camelCase = (str) => str.replace(/-./g, (x) => x[1].toUpperCase());
export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
export function kebabCase(str) {
    return str
        .split("")
        .map((letter, idx) => {
        return letter.toUpperCase() === letter
            ? `${idx !== 0 ? "-" : ""}${letter.toLowerCase()}`
            : letter;
    })
        .join("");
}
//# sourceMappingURL=strings.js.map