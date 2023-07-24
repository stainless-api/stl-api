"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelects = exports.selects = void 0;
const parseSelect_1 = require("./parseSelect");
const stl_1 = require("./stl");
const lodash_1 = require("lodash");
/**
 * Creates an select param from all selectable paths in the given zod schema
 */
function selects(schema, depth = 3) {
    return stl_1.z
        .string()
        .transform((select) => (0, parseSelect_1.parseSelect)(select))
        .superRefine((val, ctx) => {
        try {
            validateSelectTree(val, schema, depth + 1);
        }
        catch (error) {
            ctx.addIssue({
                code: stl_1.z.ZodIssueCode.custom,
                message: error instanceof Error ? error.message : String(error),
            });
        }
    })
        .withMetadata({ stainless: { selects: true } });
}
exports.selects = selects;
function validateSelectTree(selectTree, schema, depth, path = []) {
    if (depth < 0) {
        throw new Error(`selected path is too deep: ${path.join(".")}`);
    }
    const { select } = selectTree;
    if (schema instanceof stl_1.z.ZodObject) {
        if (!select || (0, lodash_1.isEmpty)(select)) {
            if (depth === 0) {
                // last element of select path is an object, but object
                // properties would be one level too deep
                throw new Error(`selected path is too deep: ${path.join(".")}`);
            }
            return selectTree;
        }
        for (const key of Object.keys(select)) {
            const subtree = select[key];
            const subschema = schema.shape[key];
            if (!subschema) {
                throw new Error(`selected path doesn't exist: ${[...path, key].join(".")}`);
            }
            // TODO: error if a terminal field on a non-selectable object is selected,
            // like (posts) items.user.id.  This is tricky because items.user.comments_fields.id
            // is selectable, so we can't simply error when we get to items.user.
            validateSelectTree(subtree, subschema, depth - 1, [...path, key]);
        }
        return selectTree;
    }
    if (schema instanceof stl_1.z.ZodNullable ||
        schema instanceof stl_1.z.ZodOptional ||
        schema instanceof stl_1.z.ZodMetadata) {
        return validateSelectTree(selectTree, schema.unwrap(), depth, path);
    }
    if (schema instanceof stl_1.z.ZodDefault) {
        return validateSelectTree(selectTree, schema._def.innerType, depth, path);
    }
    if (schema instanceof stl_1.z.ZodLazy) {
        return validateSelectTree(selectTree, schema.schema, depth, path);
    }
    if (schema instanceof stl_1.z.ZodArray) {
        return validateSelectTree(selectTree, schema.element, depth, path);
    }
    if (schema instanceof stl_1.z.ZodEffects) {
        return validateSelectTree(selectTree, schema.innerType(), depth, path);
    }
    if (schema instanceof stl_1.z.ZodPipeline) {
        return validateSelectTree(selectTree, schema._def.out, depth, path);
    }
    // TODO union, intersection, discriminated union?
    if (!select || (0, lodash_1.isEmpty)(select))
        return selectTree;
    throw new Error(`unsupported schema type: ${schema.constructor.name}`);
}
function getSelects(ctx) {
    var _a, _b;
    const select = (_b = (_a = ctx.parsedParams) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.select;
    if (select != null && !(0, lodash_1.isPlainObject)(select)) {
        throw new Error(`invalid select param; use z.selects()`);
    }
    return select;
}
exports.getSelects = getSelects;
//# sourceMappingURL=selects.js.map