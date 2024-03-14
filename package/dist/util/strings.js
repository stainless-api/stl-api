"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kebabCase = void 0;
// TODO(someday): pull in a lib to cover more edge cases
function kebabCase(str) {
    return str
        .split("")
        .map((letter, idx) => {
        return letter.toUpperCase() === letter
            ? `${idx !== 0 ? "-" : ""}${letter.toLowerCase()}`
            : letter;
    })
        .join("");
}
exports.kebabCase = kebabCase;
//# sourceMappingURL=strings.js.map