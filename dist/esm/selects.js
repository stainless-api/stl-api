import { parseSelect } from "./parseSelect";
import * as z from "./z";
import { isEmpty, isPlainObject } from "lodash";
export const selectsSymbol = Symbol("selects");
/**
 * Creates an select param from all selectable paths in the given zod schema
 */
export function selects(schema, depth = 3) {
    return z
        .string()
        .transform((select) => {
        const result = parseSelect(select);
        Object.defineProperty(result, selectsSymbol, {
            enumerable: false,
            value: true,
        });
        return result;
    })
        .superRefine((val, ctx) => {
        try {
            validateSelectTree(val, schema, depth + 1);
        }
        catch (error) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: error instanceof Error ? error.message : String(error),
            });
        }
    })
        .withMetadata({ stainless: { selects: true } });
}
function validateSelectTree(selectTree, schema, depth, path = []) {
    if (depth < 0) {
        throw new Error(`selected path is too deep: ${path.join(".")}`);
    }
    const { select } = selectTree;
    if (schema instanceof z.ZodObject) {
        if (!select || isEmpty(select)) {
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
    if (schema instanceof z.ZodNullable ||
        schema instanceof z.ZodOptional ||
        schema instanceof z.ZodMetadata) {
        return validateSelectTree(selectTree, schema.unwrap(), depth, path);
    }
    if (schema instanceof z.ZodDefault) {
        return validateSelectTree(selectTree, schema._def.innerType, depth, path);
    }
    if (schema instanceof z.ZodLazy) {
        return validateSelectTree(selectTree, schema.schema, depth, path);
    }
    if (schema instanceof z.ZodArray) {
        return validateSelectTree(selectTree, schema.element, depth, path);
    }
    if (schema instanceof z.ZodEffects) {
        return validateSelectTree(selectTree, schema.innerType(), depth, path);
    }
    if (schema instanceof z.ZodPipeline) {
        return validateSelectTree(selectTree, schema._def.out, depth, path);
    }
    // TODO union, intersection, discriminated union?
    if (!select || isEmpty(select))
        return selectTree;
    throw new Error(`unsupported schema type: ${schema.constructor.name}`);
}
export function getSelects(ctx) {
    var _a, _b, _c;
    const query = (_a = ctx.parsedParams) === null || _a === void 0 ? void 0 : _a.query;
    if (!query)
        return undefined;
    for (const param of Object.values(query)) {
        if (param != null && param[selectsSymbol]) {
            const select = (_c = (_b = ctx.parsedParams) === null || _b === void 0 ? void 0 : _b.query) === null || _c === void 0 ? void 0 : _c.select;
            if (select != null && !isPlainObject(select)) {
                throw new Error(`invalid select param; use z.selects()`);
            }
            return select;
        }
    }
    return undefined;
}
//# sourceMappingURL=selects.js.map