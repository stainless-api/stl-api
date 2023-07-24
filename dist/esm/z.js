var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { extendZodWithOpenApi } from "zod-openapi";
import { z, isValid, ZodFirstPartyTypeKind, } from "zod";
import { getSelects } from "./selects";
import { getIncludes } from "./includes";
import { pickBy } from "lodash/fp";
import { mapValues } from "lodash";
export * from "zod";
export { selects } from "./selects";
export { includes } from "./includes";
/**
 * TODO: try to come up with a better error message
 * that you must import stl _before_ zod
 * in any file that uses z.openapi(),
 * including the file that calls stl.openapiSpec().
 */
extendZodWithOpenApi(z); // https://github.com/asteasolutions/zod-to-openapi#the-openapi-method
/**
 * Class for storing custom metadata like `prismaModel`,
 * `pageResponse: true`, `includable: true`, etc.
 *
 * zod-openapi errors out on any new class that extends the base
 * ZodType, so I made this extend a no-op refinement for compatibility.
 * Extending ZodLazy would be another option
 */
export class ZodMetadata extends z.ZodEffects {
    constructor(def, metadata) {
        super(def);
        this.metadata = metadata;
    }
    unwrap() {
        return this._def.schema;
    }
}
ZodMetadata.create = (innerType, metadata, params) => {
    return new ZodMetadata(innerType.refine((x) => true)._def, metadata);
};
z.ZodType.prototype.withMetadata = function withMetadata(metadata) {
    return ZodMetadata.create(this, metadata, this._def);
};
export const withMetadata = ZodMetadata.create;
function satisfies(a, b) {
    if (Array.isArray(b)) {
        return (Array.isArray(a) &&
            a.length === b.length &&
            a.every((elem, i) => satisfies(elem, b[i])));
    }
    if (b != null && typeof b === "object") {
        return (a != null &&
            typeof a === "object" &&
            Object.entries(b).every(([key, value]) => satisfies(a[key], value)));
    }
    if (typeof b === "function") {
        return typeof a === "function";
    }
    return Object.is(a, b);
}
export function extractMetadata(schema, satisfying = {}) {
    if (schema instanceof ZodMetadata) {
        if (satisfies(schema.metadata, satisfying)) {
            return schema.metadata;
        }
        return extractMetadata(schema.unwrap(), satisfying);
    }
    if (schema instanceof z.ZodOptional)
        return extractMetadata(schema.unwrap(), satisfying);
    if (schema instanceof z.ZodNullable)
        return extractMetadata(schema.unwrap(), satisfying);
    if (schema instanceof z.ZodDefault)
        return extractMetadata(schema.removeDefault(), satisfying);
    if (schema instanceof z.ZodLazy)
        return extractMetadata(schema.schema, satisfying);
    if (schema instanceof z.ZodEffects)
        return extractMetadata(schema._def.schema, satisfying);
    if (schema instanceof z.ZodCatch)
        return extractMetadata(schema.removeCatch(), satisfying);
    if (schema instanceof z.ZodBranded)
        return extractMetadata(schema.unwrap(), satisfying);
    if (schema instanceof z.ZodPipeline)
        return extractMetadata(schema._def.out, satisfying);
    if (schema instanceof z.ZodPromise)
        return extractMetadata(schema.unwrap(), satisfying);
    return undefined;
}
export function extractDeepMetadata(schema, satisfying = {}) {
    if (schema instanceof z.ZodArray)
        return extractDeepMetadata(schema.element, satisfying);
    if (schema instanceof z.ZodSet)
        return extractDeepMetadata(schema._def.valueType, satisfying);
    return extractMetadata(schema, satisfying);
}
export const includableSymbol = Symbol("includable");
z.ZodType.prototype.includable = function includable() {
    return stlPreprocess((input, stlContext) => {
        const { data, path } = input;
        const include = getIncludes(stlContext);
        return include && zodPathIsIncluded(path, include) ? data : undefined;
    }, this.optional())
        .openapi({ effectType: "input" })
        .withMetadata({ stainless: { includable: true } });
};
export function isIncludable(schema) {
    return (extractDeepMetadata(schema, { stainless: { includable: true } }) !=
        null);
}
function zodPathIsIncluded(zodPath, include) {
    const zodPathStr = zodPath.filter((p) => typeof p === "string").join(".");
    return include.some((e) => e === zodPathStr || e.startsWith(`${zodPathStr}.`));
}
export const selectableSymbol = Symbol("selectable");
/**
 * A .selectable() property like `comments_fields`
 * actually parses the parent object's `comments`
 * property as input.
 *
 * As a consequence if `.selectable()` gets wrapped with
 * `.optional()`, the optional will see that there's no
 * value for `comments_fields` and abort before
 * `StlSelectable` gets to work its magic.
 */
class StlSelectable extends z.ZodOptional {
    _parse(input) {
        var _a;
        const { path, parent } = input;
        const ctx = getStlParseContext(parent);
        const select = ctx ? getSelects(ctx) : undefined;
        if (!select)
            return z.OK(undefined);
        const property = path[path.length - 1];
        if (typeof property !== "string" || !property.endsWith("_fields")) {
            throw new Error(`.selectable() property must be a string ending with _fields`);
        }
        const parentData = parent.data;
        if (!(parentData instanceof Object) || typeof property !== "string") {
            return z.OK(undefined);
        }
        const selectionHere = (_a = path.reduce((tree, elem) => { var _a; return (typeof elem === "number" ? tree : (_a = tree === null || tree === void 0 ? void 0 : tree.select) === null || _a === void 0 ? void 0 : _a[elem]); }, select)) === null || _a === void 0 ? void 0 : _a.select;
        if (!selectionHere)
            return z.OK(undefined);
        const parsed = super._parse(Object.create(input, {
            data: { value: parentData[property.replace(/_fields$/, "")] },
        }));
        const pickSelected = pickBy((v, k) => selectionHere[k]);
        return convertParseReturn(parsed, (value) => Array.isArray(value) ? value.map(pickSelected) : pickSelected(value));
    }
}
z.ZodType.prototype.selection = function selection() {
    if (this instanceof ZodMetadata) {
        return this.unwrap().selection();
    }
    if (!(this instanceof z.ZodObject)) {
        throw new Error(`.selection() must be called on a ZodObject`);
    }
    const { shape } = this;
    // don't wrap StlSelectable fields with ZodOptional,
    // because they don't rely on the _field property
    // acually being present
    const mask = mapValues(shape, (value) => value instanceof StlSelectable ? undefined : true);
    return this.partial(mask);
};
z.ZodType.prototype.selectable = function selectable() {
    return new StlSelectable(this.optional()._def);
};
function getStlParseContext(ctx) {
    while (ctx.parent != null)
        ctx = ctx.parent;
    return ctx.stlContext;
}
function handleParseReturn(result, handle) {
    return z.isAsync(result) ? result.then(handle) : handle(result);
}
function convertParseReturn(result, convert) {
    return handleParseReturn(result, (result) => {
        switch (result.status) {
            case "aborted":
                return result;
            case "dirty":
                return z.DIRTY(convert(result.value));
            case "valid":
                return z.OK(convert(result.value));
        }
    });
}
z.ZodType.prototype.safeParseAsync = function safeParseAsync(data, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const ctx = {
            stlContext: params === null || params === void 0 ? void 0 : params.stlContext,
            common: {
                issues: [],
                contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
                async: true,
            },
            path: (params === null || params === void 0 ? void 0 : params.path) || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: z.getParsedType(data),
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = yield (z.isAsync(maybeAsyncResult)
            ? maybeAsyncResult
            : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
    });
};
const handleResult = (ctx, result) => {
    if (z.isValid(result)) {
        return { success: true, data: result.value };
    }
    else {
        if (!ctx.common.issues.length) {
            throw new Error("Validation failed but no issues detected.");
        }
        return {
            success: false,
            get error() {
                if (this._error)
                    return this._error;
                const error = new z.ZodError(ctx.common.issues);
                this._error = error;
                return this._error;
            },
        };
    }
};
const zodEffectsSuperParse = z.ZodEffects.prototype._parse;
z.ZodEffects.prototype._parse = function _parse(input) {
    const effect = this._def.effect || null;
    if (effect.stlPreprocess) {
        const stlContext = getStlParseContext(input.parent);
        if (!stlContext) {
            throw new Error(`missing stlContext in .stlTransform effect`);
        }
        const { ctx } = this._processInputParams(input);
        const processed = effect.transform({ data: ctx.data, path: ctx.path, parent: ctx }, stlContext);
        if (ctx.common.issues.length) {
            return {
                status: "dirty",
                value: ctx.data,
            };
        }
        if (ctx.common.async) {
            return Promise.resolve(processed).then((processed) => {
                return this._def.schema._parseAsync({
                    data: processed,
                    path: ctx.path,
                    parent: ctx,
                });
            });
        }
        else {
            return this._def.schema._parseSync({
                data: processed,
                path: ctx.path,
                parent: ctx,
            });
        }
    }
    if (effect.stlTransform) {
        const stlContext = getStlParseContext(input.parent);
        if (!stlContext) {
            throw new Error(`missing stlContext in .stlTransform effect`);
        }
        const { status, ctx } = this._processInputParams(input);
        return this._def.schema
            ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
            .then((base) => {
            if (!isValid(base))
                return base;
            return Promise.resolve(effect.transform({ data: base.value, path: input.path, parent: input.parent }, stlContext)).then((result) => ({ status: status.value, value: result }));
        });
    }
    return zodEffectsSuperParse.call(this, input);
};
z.ZodType.prototype.stlTransform = function stlTransform(transform) {
    return new z.ZodEffects({
        description: this._def.description,
        schema: this,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect: {
            type: "transform",
            transform,
            stlTransform: true,
        },
    });
};
export function stlPreprocess(preprocess, schema) {
    return new z.ZodEffects({
        description: schema._def.description,
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect: {
            type: "preprocess",
            transform: preprocess,
            stlPreprocess: true,
        },
    });
}
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/////////////// REST Types ///////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
export function path(shape, params) {
    return z.object(shape, params);
}
// TODO: make properties optional by default
export class StlParams extends z.ZodObject {
}
export function query(shape, params) {
    return new StlParams(z.object(shape, params)._def);
}
export function body(shape, params) {
    return new StlParams(z.object(shape, params)._def);
}
export function response(shape, params) {
    return z.object(shape, params);
}
const commonPageResponseFields = {
    startCursor: z.string().nullable(),
    endCursor: z.string().nullable(),
    hasNextPage: z.boolean().optional(),
    hasPreviousPage: z.boolean().optional(),
};
class PageResponseWrapper {
    wrapped(item) {
        return z.object(Object.assign(Object.assign({}, commonPageResponseFields), { items: z.array(item) }));
    }
}
export function pageResponse(item) {
    const baseMetadata = extractDeepMetadata(item);
    return response(Object.assign(Object.assign({}, commonPageResponseFields), { items: z.array(item) })).withMetadata(Object.assign(Object.assign({}, baseMetadata), { stainless: Object.assign(Object.assign({}, baseMetadata === null || baseMetadata === void 0 ? void 0 : baseMetadata.stainless), { pageResponse: true }) }));
}
export function isPageResponse(schema) {
    return (extractMetadata(schema, { stainless: { pageResponse: true } }) !=
        null);
}
export const AnyPageData = z.object({
    items: z.array(z.any()),
    startCursor: z.string().nullable(),
    endCursor: z.string().nullable(),
    hasNextPage: z.boolean().optional(),
    hasPreviousPage: z.boolean().optional(),
});
export const SortDirection = z.union([z.literal("asc"), z.literal("desc")]);
export const PaginationParams = z.object({
    pageAfter: z.string().optional(),
    pageBefore: z.string().optional(),
    pageSize: z.coerce.number().positive().default(20),
    // TODO consider whether/how to expose these by default.
    sortBy: z.string(),
    sortDirection: SortDirection.default("asc"),
});
//# sourceMappingURL=z.js.map