"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitPathIntoParts = void 0;
function splitPathIntoParts(path) {
    const [_method, url] = path.split(" ");
    return url
        .split("/")
        .filter((p) => p !== "")
        .map((p) => p.startsWith("{") && p.endsWith("}")
        ? {
            type: "param",
            name: p.replace("{", "").replace("}", ""),
        }
        : {
            type: "resource",
            name: p,
        });
}
exports.splitPathIntoParts = splitPathIntoParts;
//# sourceMappingURL=endpoint.js.map