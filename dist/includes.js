"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIncludes = exports.includes = void 0;
const stl_1 = require("./stl");
/**
 * Creates an include param from all includable paths in the given zod schema
 */
function includes(schema, depth = 3) {
    const values = [];
    function add(path, schema, depth) {
        if (depth < 0)
            return;
        const { shape } = schema;
        for (const key in shape) {
            const value = shape[key];
            const obj = unwrapIncludable(value);
            if (!obj)
                continue;
            const subpath = path ? `${path}.${key}` : key;
            if (stl_1.z.isIncludable(value))
                values.push(subpath);
            add(subpath, obj, depth - 1);
        }
    }
    const obj = unwrapIncludable(schema);
    if (obj)
        add("", obj, depth);
    const [first, ...rest] = values;
    if (!first) {
        throw new Error(`schema has no includable properties`);
    }
    return stl_1.z.array(stl_1.z.enum([first, ...rest])).withMetadata({ stainless: { includes: true } });
}
exports.includes = includes;
function unwrapIncludable(e) {
    if (e instanceof stl_1.z.ZodObject) {
        return e;
    }
    if (e instanceof stl_1.z.ZodOptional ||
        e instanceof stl_1.z.ZodNullable ||
        e instanceof stl_1.z.ZodMetadata) {
        return unwrapIncludable(e.unwrap());
    }
    if (e instanceof stl_1.z.ZodDefault) {
        return unwrapIncludable(e._def.innerType);
    }
    if (e instanceof stl_1.z.ZodLazy) {
        return unwrapIncludable(e.schema);
    }
    if (e instanceof stl_1.z.ZodEffects) {
        return unwrapIncludable(e.innerType());
    }
    if (e instanceof stl_1.z.ZodArray) {
        return unwrapIncludable(e.element);
    }
    if (e instanceof stl_1.z.ZodPipeline) {
        return unwrapIncludable(e._def.out);
    }
    // TODO: union, intersection, discriminated union?
}
function getIncludes(ctx) {
    var _a, _b;
    const include = (_b = (_a = ctx.parsedParams) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.include;
    if (include != null &&
        (!Array.isArray(include) || include.some((e) => typeof e !== "string"))) {
        throw new Error(`invalid include param; use z.includes()`);
    }
    return include;
}
exports.getIncludes = getIncludes;
//# sourceMappingURL=includes.js.map