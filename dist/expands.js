"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpands = exports.expandSubPaths = exports.expandsOptions = exports.expands = void 0;
const stl_1 = require("./stl");
/**
 * Creates an expand param from all expandable paths in the given zod schema
 */
function expands(schema, depth = 3) {
    const values = [];
    function add(path, schema, depth) {
        if (depth < 0)
            return;
        const { shape } = schema;
        for (const key in shape) {
            const value = shape[key];
            const obj = unwrapExpandable(value);
            if (!obj)
                continue;
            const subpath = path ? `${path}.${key}` : key;
            if (isExpandable(value))
                values.push(subpath);
            add(subpath, obj, depth - 1);
        }
    }
    const obj = unwrapExpandable(schema);
    if (obj)
        add("", obj, depth);
    const [first, ...rest] = values;
    if (!first) {
        throw new Error(`schema has no expandable properties`);
    }
    return stl_1.z.array(stl_1.z.enum([first, ...rest])).stlMetadata({ expands: true });
}
exports.expands = expands;
/**
 * Given an zod schema from `expands`, extracts the possible options
 */
function expandsOptions(param) {
    if (param instanceof stl_1.z.ZodOptional || param instanceof stl_1.z.ZodNullable)
        return expandsOptions(param.unwrap());
    if (param instanceof stl_1.z.ZodDefault)
        return expandsOptions(param._def.innerType);
    if (!(param instanceof stl_1.z.ZodArray)) {
        throw new Error(`param must be a ZodArray of a ZodEnum of string`);
    }
    const { element } = param;
    if (!(element instanceof stl_1.z.ZodEnum)) {
        throw new Error(`param must be a ZodArray of a ZodEnum of string`);
    }
    return element.options;
}
exports.expandsOptions = expandsOptions;
function isExpandable(e) {
    var _a, _b;
    return (_b = (_a = stl_1.z.extractStlMetadata(e)) === null || _a === void 0 ? void 0 : _a.expandable) !== null && _b !== void 0 ? _b : false;
}
function unwrapExpandable(e) {
    if (e instanceof stl_1.z.ZodObject) {
        return e;
    }
    if (e instanceof stl_1.z.ZodOptional || e instanceof stl_1.z.ZodNullable) {
        return unwrapExpandable(e.unwrap());
    }
    if (e instanceof stl_1.z.ZodDefault) {
        return unwrapExpandable(e._def.innerType);
    }
    if (e instanceof stl_1.z.ZodLazy) {
        return unwrapExpandable(e.schema);
    }
    if (e instanceof stl_1.z.ZodEffects) {
        return unwrapExpandable(e.innerType());
    }
    if (e instanceof stl_1.z.ZodArray) {
        return unwrapExpandable(e.element);
    }
    if (e instanceof stl_1.z.ZodPipeline) {
        return unwrapExpandable(e._def.out);
    }
    // TODO: union, intersection, discriminated union?
}
function expandSubPaths(expand, path) {
    const prefix = `${path}.`;
    return expand.flatMap((path) => path.startsWith(prefix) ? [path.substring(prefix.length)] : []);
}
exports.expandSubPaths = expandSubPaths;
function getExpands(ctx) {
    var _a, _b;
    const expand = (_b = (_a = ctx.parsedParams) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.expand;
    if (expand != null &&
        (!Array.isArray(expand) || expand.some((e) => typeof e !== "string"))) {
        throw new Error(`invalid expand param; use z.expands()`);
    }
    return expand;
}
exports.getExpands = getExpands;
//# sourceMappingURL=expands.js.map