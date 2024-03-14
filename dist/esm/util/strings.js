// TODO(someday): pull in a lib to cover more edge cases
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