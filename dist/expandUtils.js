"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExpandParents = void 0;
/**
 * Given a set of expands like `['items.user', 'items.comments.user']`, adds
 * parent paths, so the result is
 * `new Set(['items', 'items.user', 'items.comments', 'items.comments.user'])`
 */
function addExpandParents(expand) {
    const result = new Set();
    function add(path) {
        result.add(path);
        const lastDot = path.lastIndexOf(".");
        if (lastDot >= 0) {
            add(path.slice(0, lastDot));
        }
    }
    expand.forEach(add);
    return result;
}
exports.addExpandParents = addExpandParents;
//# sourceMappingURL=expandUtils.js.map