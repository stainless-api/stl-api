"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExpandParents = exports.expandSubPaths = exports.expandsOptions = void 0;
const stainless_1 = require("stainless");
/**
 * Given an zod schema from `expands`, extracts the possible options
 */
function expandsOptions(param) {
    if (param instanceof stainless_1.z.ZodOptional || param instanceof stainless_1.z.ZodNullable)
        return expandsOptions(param.unwrap());
    if (param instanceof stainless_1.z.ZodDefault)
        return expandsOptions(param._def.innerType);
    if (!(param instanceof stainless_1.z.ZodArray)) {
        throw new Error(`param must be a ZodArray of a ZodEnum of string`);
    }
    const { element } = param;
    if (!(element instanceof stainless_1.z.ZodEnum)) {
        throw new Error(`param must be a ZodArray of a ZodEnum of string`);
    }
    return element.options;
}
exports.expandsOptions = expandsOptions;
function expandSubPaths(expand, path) {
    const prefix = `${path}.`;
    return expand.flatMap((path) => path.startsWith(prefix) ? [path.substring(prefix.length)] : []);
}
exports.expandSubPaths = expandSubPaths;
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
//# sourceMappingURL=expandsUtils.js.map