"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includeSubPaths = void 0;
function includeSubPaths(include, path) {
    const prefix = `${path}.`;
    return include.flatMap((path) => path.startsWith(prefix) ? [path.substring(prefix.length)] : []);
}
exports.includeSubPaths = includeSubPaths;
//# sourceMappingURL=includeUtils.js.map