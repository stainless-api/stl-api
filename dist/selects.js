"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelects = exports.selects = exports.selectsSymbol = void 0;
const parseSelect_1 = require("./parseSelect");
const z = __importStar(require("./z"));
const lodash_1 = require("lodash");
exports.selectsSymbol = Symbol("selects");
/**
 * Creates an select param from all selectable paths in the given zod schema
 */
function selects(schema, depth = 3) {
    return z
        .string()
        .transform((select) => {
        const result = (0, parseSelect_1.parseSelect)(select);
        Object.defineProperty(result, exports.selectsSymbol, {
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
exports.selects = selects;
function validateSelectTree(selectTree, schema, depth, path = []) {
    if (depth < 0) {
        throw new Error(`selected path is too deep: ${path.join(".")}`);
    }
    const { select } = selectTree;
    if (schema instanceof z.ZodObject) {
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
    if (!select || (0, lodash_1.isEmpty)(select))
        return selectTree;
    throw new Error(`unsupported schema type: ${schema.constructor.name}`);
}
function getSelects(ctx) {
    var _a, _b, _c;
    const query = (_a = ctx.parsedParams) === null || _a === void 0 ? void 0 : _a.query;
    if (!query)
        return undefined;
    for (const param of Object.values(query)) {
        if (param != null && param[exports.selectsSymbol]) {
            const select = (_c = (_b = ctx.parsedParams) === null || _b === void 0 ? void 0 : _b.query) === null || _c === void 0 ? void 0 : _c.select;
            if (select != null && !(0, lodash_1.isPlainObject)(select)) {
                throw new Error(`invalid select param; use z.selects()`);
            }
            return select;
        }
    }
    return undefined;
}
exports.getSelects = getSelects;
//# sourceMappingURL=selects.js.map