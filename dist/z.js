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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationParams = exports.SortDirection = exports.AnyPageData = exports.pageResponse = exports.response = exports.body = exports.query = exports.StlParams = exports.path = exports.selectableSymbol = exports.expandableSymbol = exports.extractStlMetadata = exports.stlMetadataSymbol = exports.expands = exports.selects = void 0;
const zod_openapi_1 = require("zod-openapi");
const zod_1 = require("zod");
const selects_1 = require("./selects");
const expands_1 = require("./expands");
const fp_1 = require("lodash/fp");
const lodash_1 = require("lodash");
__exportStar(require("zod"), exports);
var selects_2 = require("./selects");
Object.defineProperty(exports, "selects", { enumerable: true, get: function () { return selects_2.selects; } });
var expands_2 = require("./expands");
Object.defineProperty(exports, "expands", { enumerable: true, get: function () { return expands_2.expands; } });
/**
 * TODO: try to come up with a better error message
 * that you must import stl _before_ zod
 * in any file that uses z.openapi(),
 * including the file that calls stl.openapiSpec().
 */
(0, zod_openapi_1.extendZodWithOpenApi)(zod_1.z); // https://github.com/asteasolutions/zod-to-openapi#the-openapi-method
exports.stlMetadataSymbol = Symbol("stlMetadata");
zod_1.z.ZodType.prototype.stlMetadata = function stlMetadata(metadata) {
    return new this.constructor(Object.assign(Object.assign({}, this._def), { [exports.stlMetadataSymbol]: Object.assign(Object.assign({}, this._def[exports.stlMetadataSymbol]), metadata) }));
};
function extractStlMetadata(schema) {
    const own = schema._def[exports.stlMetadataSymbol];
    if (own)
        return own;
    if (schema instanceof zod_1.z.ZodOptional) {
        return extractStlMetadata(schema.unwrap());
    }
    if (schema instanceof zod_1.z.ZodNullable) {
        return extractStlMetadata(schema.unwrap());
    }
    if (schema instanceof zod_1.z.ZodDefault) {
        return extractStlMetadata(schema.removeDefault());
    }
    if (schema instanceof zod_1.z.ZodLazy) {
        return extractStlMetadata(schema.schema);
    }
    if (schema instanceof zod_1.z.ZodEffects) {
        return extractStlMetadata(schema.innerType());
    }
    if (schema instanceof zod_1.z.ZodCatch) {
        return extractStlMetadata(schema.removeCatch());
    }
    if (schema instanceof zod_1.z.ZodBranded) {
        return extractStlMetadata(schema.unwrap());
    }
    if (schema instanceof zod_1.z.ZodArray) {
        return extractStlMetadata(schema.element);
    }
    if (schema instanceof zod_1.z.ZodPromise) {
        return extractStlMetadata(schema.unwrap());
    }
    if (schema instanceof zod_1.z.ZodSet) {
        return extractStlMetadata(schema._def.valueType);
    }
    if (schema instanceof zod_1.z.ZodPipeline) {
        return extractStlMetadata(schema._def.out);
    }
    return {};
}
exports.extractStlMetadata = extractStlMetadata;
exports.expandableSymbol = Symbol("expandable");
class StlExpandable extends zod_1.z.ZodOptional {
    _parse(input) {
        const ctx = getStlParseContext(input.parent);
        const expand = ctx ? (0, expands_1.getExpands)(ctx) : undefined;
        if (!expand || !zodPathIsExpanded(input.path, expand)) {
            return zod_1.z.OK(undefined);
        }
        return super._parse(input);
    }
}
zod_1.z.ZodType.prototype.expandable = function expandable() {
    return new StlExpandable(this.optional().stlMetadata({ expandable: true })._def);
};
function zodPathIsExpanded(zodPath, expand) {
    const zodPathStr = zodPath.filter((p) => typeof p === "string").join(".");
    return expand.some((e) => e === zodPathStr || e.startsWith(`${zodPathStr}.`));
}
const zodObjectSuperParse = zod_1.z.ZodObject.prototype._parse;
zod_1.z.ZodObject.prototype._parse = function _parse(input) {
    var _a, _b, _c;
    const { path } = input;
    const expand = (_c = (_b = (_a = getStlParseContext(input.parent)) === null || _a === void 0 ? void 0 : _a.parsedParams) === null || _b === void 0 ? void 0 : _b.query) === null || _c === void 0 ? void 0 : _c.expand;
    const parsed = zodObjectSuperParse.call(this, input);
    // @ts-expect-error only expandable (optional) props are getting omitted
    return convertParseReturn(parsed, (0, fp_1.omitBy)((v, key) => {
        var _a;
        return this.shape[key] && // I don't know why this would be undefined but it happened...
            ((_a = extractStlMetadata(this.shape[key])) === null || _a === void 0 ? void 0 : _a.expandable) &&
            expand &&
            !zodPathIsExpanded([...path, key], expand);
    }));
};
exports.selectableSymbol = Symbol("selectable");
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
class StlSelectable extends zod_1.z.ZodOptional {
    _parse(input) {
        var _a;
        const { path, parent } = input;
        const ctx = getStlParseContext(parent);
        const select = ctx ? (0, selects_1.getSelects)(ctx) : undefined;
        if (!select)
            return zod_1.z.OK(undefined);
        const property = path[path.length - 1];
        if (typeof property !== "string" || !property.endsWith("_fields")) {
            throw new Error(`.selectable() property must be a string ending with _fields`);
        }
        if (!(parent.data instanceof Object) || typeof property !== "string") {
            return zod_1.z.OK(undefined);
        }
        const selectionHere = (_a = path.reduce((tree, elem) => { var _a; return (typeof elem === "number" ? tree : (_a = tree === null || tree === void 0 ? void 0 : tree.select) === null || _a === void 0 ? void 0 : _a[elem]); }, select)) === null || _a === void 0 ? void 0 : _a.select;
        if (!selectionHere)
            return zod_1.z.OK(undefined);
        const parsed = super._parse(Object.create(input, {
            data: { value: parent.data[property.replace(/_fields$/, "")] },
        }));
        const pickSelected = (0, fp_1.pickBy)((v, k) => selectionHere[k]);
        return convertParseReturn(parsed, (value) => Array.isArray(value) ? value.map(pickSelected) : pickSelected(value));
    }
}
zod_1.z.ZodType.prototype.selection = function selection() {
    if (!(this instanceof zod_1.z.ZodObject)) {
        throw new Error(`.selection() must be called on a ZodObject`);
    }
    const { shape } = this;
    // don't wrap StlSelectable fields with ZodOptional,
    // because they don't rely on the _field property
    // acually being present
    const mask = (0, lodash_1.mapValues)(shape, (value) => value instanceof StlSelectable ? undefined : true);
    return this.partial(mask);
};
zod_1.z.ZodType.prototype.selectable = function selectable() {
    return new StlSelectable(this.optional().stlMetadata({ selectable: true })._def);
};
function getStlParseContext(ctx) {
    while (ctx.parent != null)
        ctx = ctx.parent;
    return ctx.stlContext;
}
function handleParseReturn(result, handle) {
    return zod_1.z.isAsync(result) ? result.then(handle) : handle(result);
}
function convertParseReturn(result, convert) {
    return handleParseReturn(result, (result) => {
        switch (result.status) {
            case "aborted":
                return result;
            case "dirty":
                return zod_1.z.DIRTY(convert(result.value));
            case "valid":
                return zod_1.z.OK(convert(result.value));
        }
    });
}
zod_1.z.ZodType.prototype.safeParseAsync = function safeParseAsync(data, params) {
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
            parsedType: zod_1.z.getParsedType(data),
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = yield (zod_1.z.isAsync(maybeAsyncResult)
            ? maybeAsyncResult
            : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
    });
};
const handleResult = (ctx, result) => {
    if (zod_1.z.isValid(result)) {
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
                const error = new zod_1.z.ZodError(ctx.common.issues);
                this._error = error;
                return this._error;
            },
        };
    }
};
const zodEffectsSuperParse = zod_1.z.ZodEffects.prototype._parse;
zod_1.z.ZodEffects.prototype._parse = function _parse(input) {
    var _a;
    const effect = this._def.effect || null;
    if ((_a = effect[exports.stlMetadataSymbol]) === null || _a === void 0 ? void 0 : _a.stlTransform) {
        const stlContext = getStlParseContext(input.parent);
        if (!stlContext) {
            throw new Error(`missing stlContext in .stlTransform effect`);
        }
        const { status, ctx } = this._processInputParams(input);
        return this._def.schema
            ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
            .then((base) => {
            if (!(0, zod_1.isValid)(base))
                return base;
            return Promise.resolve(effect.transform(base.value, stlContext, input.parent)).then((result) => ({ status: status.value, value: result }));
        });
    }
    return zodEffectsSuperParse.call(this, input);
};
zod_1.z.ZodType.prototype.stlTransform = function stlTransform(transform) {
    return new zod_1.z.ZodEffects({
        description: this._def.description,
        schema: this,
        typeName: zod_1.ZodFirstPartyTypeKind.ZodEffects,
        effect: {
            type: "transform",
            transform,
            [exports.stlMetadataSymbol]: { stlTransform: true },
        },
    });
};
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/////////////// REST Types ///////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
function path(shape, params) {
    return zod_1.z.object(shape, params);
}
exports.path = path;
// TODO: make properties optional by default
class StlParams extends zod_1.z.ZodObject {
}
exports.StlParams = StlParams;
function query(shape, params) {
    return new StlParams(zod_1.z.object(shape, params)._def);
}
exports.query = query;
function body(shape, params) {
    return new StlParams(zod_1.z.object(shape, params)._def);
}
exports.body = body;
function response(shape, params) {
    return zod_1.z.object(shape, params).stlMetadata({ response: true });
}
exports.response = response;
const commonPageResponseFields = {
    startCursor: zod_1.z.string().nullable(),
    endCursor: zod_1.z.string().nullable(),
    hasNextPage: zod_1.z.boolean().optional(),
    hasPreviousPage: zod_1.z.boolean().optional(),
};
class PageResponseWrapper {
    wrapped(item) {
        return zod_1.z.object(Object.assign(Object.assign({}, commonPageResponseFields), { items: zod_1.z.array(item) }));
    }
}
function pageResponse(item) {
    return response(Object.assign(Object.assign({}, commonPageResponseFields), { items: zod_1.z.array(item) })).stlMetadata(Object.assign(Object.assign({}, extractStlMetadata(item)), { pageResponse: true }));
}
exports.pageResponse = pageResponse;
exports.AnyPageData = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.any()),
    startCursor: zod_1.z.string().nullable(),
    endCursor: zod_1.z.string().nullable(),
    hasNextPage: zod_1.z.boolean().optional(),
    hasPreviousPage: zod_1.z.boolean().optional(),
});
exports.SortDirection = zod_1.z.union([zod_1.z.literal("asc"), zod_1.z.literal("desc")]);
exports.PaginationParams = zod_1.z.object({
    pageAfter: zod_1.z.string().optional(),
    pageBefore: zod_1.z.string().optional(),
    pageSize: zod_1.z.coerce.number().positive().default(20),
    // TODO consider whether/how to expose these by default.
    sortBy: zod_1.z.string(),
    sortDirection: exports.SortDirection.default("asc"),
});
//# sourceMappingURL=z.js.map