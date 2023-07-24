import { z } from "./stl";
/**
 * Creates an include param from all includable paths in the given zod schema
 */
export function includes(schema, depth = 3) {
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
            if (z.isIncludable(value))
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
    return z.array(z.enum([first, ...rest])).withMetadata({ stainless: { includes: true } });
}
function unwrapIncludable(e) {
    if (e instanceof z.ZodObject) {
        return e;
    }
    if (e instanceof z.ZodOptional ||
        e instanceof z.ZodNullable ||
        e instanceof z.ZodMetadata) {
        return unwrapIncludable(e.unwrap());
    }
    if (e instanceof z.ZodDefault) {
        return unwrapIncludable(e._def.innerType);
    }
    if (e instanceof z.ZodLazy) {
        return unwrapIncludable(e.schema);
    }
    if (e instanceof z.ZodEffects) {
        return unwrapIncludable(e.innerType());
    }
    if (e instanceof z.ZodArray) {
        return unwrapIncludable(e.element);
    }
    if (e instanceof z.ZodPipeline) {
        return unwrapIncludable(e._def.out);
    }
    // TODO: union, intersection, discriminated union?
}
export function getIncludes(ctx) {
    var _a, _b;
    const include = (_b = (_a = ctx.parsedParams) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.include;
    if (include != null &&
        (!Array.isArray(include) || include.some((e) => typeof e !== "string"))) {
        throw new Error(`invalid include param; use z.includes()`);
    }
    return include;
}
//# sourceMappingURL=includes.js.map