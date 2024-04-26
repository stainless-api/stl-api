"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kebabCase = exports.capitalize = exports.camelCase = void 0;
// TODO(someday): pull in a lib to cover more edge cases
const camelCase = (str) => str.replace(/-./g, (x) => x[1].toUpperCase());
exports.camelCase = camelCase;
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
exports.capitalize = capitalize;
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