"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaModelLoader = exports.PrismaModelLoaderSymbol = exports.PrismaModel = exports.PrismaModelSymbol = exports.makePrismaPlugin = exports.extractPrismaModel = void 0;
const stainless_1 = require("stainless");
const includeUtils_1 = require("./includeUtils");
const lodash_1 = require("lodash");
function extractPrismaModel(schema) {
    var _a;
    const metadata = stainless_1.z.extractDeepMetadata(schema, {
        stainless: { prismaModel: () => { } },
    });
    if (metadata) {
        return (_a = metadata === null || metadata === void 0 ? void 0 : metadata.stainless) === null || _a === void 0 ? void 0 : _a.prismaModel();
    }
    return undefined;
}
exports.extractPrismaModel = extractPrismaModel;
stainless_1.z.ZodType.prototype.prismaModelLoader = function prismaModelLoader(prismaModel) {
    const result = this.stlTransform((input, ctx) => __awaiter(this, void 0, void 0, function* () {
        const id = input.data;
        const query = { where: { id } };
        const prisma = ctx.prisma;
        if (prisma && prismaModel === prisma.prismaModel) {
            return yield prisma.findUniqueOrThrow(query);
        }
        const model = prismaModel instanceof Function ? prismaModel() : prismaModel;
        return yield model.findUniqueOrThrow(query);
    }));
    // tsc -b is generating spurious errors here...
    return result.openapi({ effectType: "input" });
};
stainless_1.z.ZodType.prototype.prismaModel = function prismaModel(prismaModel) {
    return this.withMetadata({
        stainless: {
            prismaModel: prismaModel instanceof Function ? prismaModel : () => prismaModel,
        },
    });
};
function stringifyCursor(values) {
    if (values == null)
        return undefined;
    return Buffer.from(JSON.stringify(values)).toString("base64");
}
function parseCursor(cursor) {
    return JSON.parse(Buffer.from(cursor, "base64").toString());
}
function wrapQuery({ pageAfter, pageBefore, pageSize, sortBy, sortDirection = "asc", }, query) {
    const cursorString = pageAfter !== null && pageAfter !== void 0 ? pageAfter : pageBefore;
    const cursor = cursorString != null ? { [sortBy]: parseCursor(cursorString) } : undefined;
    return Object.assign(Object.assign({}, query), { cursor, skip: cursor ? 1 : 0, take: pageSize + 1, orderBy: {
            [sortBy]: pageBefore
                ? sortDirection === "desc"
                    ? "asc"
                    : "desc"
                : sortDirection,
        } });
}
function makeResponse(params, items) {
    var _a, _b;
    const { pageAfter, pageBefore, pageSize, sortBy } = params;
    const itemCount = items.length;
    items = items.slice(0, pageSize);
    if (pageBefore)
        items.reverse();
    const start = items[0];
    const end = items[items.length - 1];
    return {
        items,
        // @ts-expect-error TODO
        startCursor: (_a = stringifyCursor(start === null || start === void 0 ? void 0 : start[sortBy])) !== null && _a !== void 0 ? _a : null,
        // @ts-expect-error TODO
        endCursor: (_b = stringifyCursor(end === null || end === void 0 ? void 0 : end[sortBy])) !== null && _b !== void 0 ? _b : null,
        hasPreviousPage: pageBefore != null ? itemCount > pageSize : undefined,
        hasNextPage: pageAfter != null || pageBefore == null
            ? itemCount > pageSize
            : undefined,
    };
}
function paginate(delegate, _a) {
    var { pageAfter, pageBefore, pageSize, sortBy, sortDirection } = _a, query = __rest(_a, ["pageAfter", "pageBefore", "pageSize", "sortBy", "sortDirection"]);
    return __awaiter(this, void 0, void 0, function* () {
        const params = {
            pageAfter,
            pageBefore,
            pageSize,
            sortBy,
            sortDirection,
        };
        return makeResponse(params, yield delegate.findMany(wrapQuery(params, query)));
    });
}
function endpointWrapQuery(endpoint, context, prismaQuery) {
    var _a;
    const { response } = endpoint;
    const includeSelect = createIncludeSelect(endpoint, context, prismaQuery);
    if (stainless_1.z.isPageResponse(response)) {
        return Object.assign(Object.assign({}, wrapQuery(((_a = context.parsedParams) === null || _a === void 0 ? void 0 : _a.query) || {}, prismaQuery)), includeSelect);
    }
    return Object.assign(Object.assign({}, prismaQuery), includeSelect);
}
function createIncludeSelect(endpoint, context, prismaQuery) {
    var _a, _b, _c, _d, _e, _f;
    const queryShape = (_a = endpoint.query) === null || _a === void 0 ? void 0 : _a.shape;
    const callerInclude = prismaQuery === null || prismaQuery === void 0 ? void 0 : prismaQuery.include;
    let select = (queryShape === null || queryShape === void 0 ? void 0 : queryShape.select)
        ? (_c = (_b = context.parsedParams) === null || _b === void 0 ? void 0 : _b.query) === null || _c === void 0 ? void 0 : _c.select
        : undefined;
    if (select != null && !(0, lodash_1.isPlainObject)(select)) {
        throw new Error(`invalid select query param`);
    }
    let include = (_e = (_d = context.parsedParams) === null || _d === void 0 ? void 0 : _d.query) === null || _e === void 0 ? void 0 : _e.include;
    if (include != null &&
        (!Array.isArray(include) || include.some((e) => typeof e !== "string"))) {
        throw new Error(`invalid include query param`);
    }
    if (stainless_1.z.isPageResponse(endpoint.response)) {
        include = include ? (0, includeUtils_1.includeSubPaths)(include, "items") : undefined;
        select = (_f = select === null || select === void 0 ? void 0 : select.select) === null || _f === void 0 ? void 0 : _f.items;
    }
    let result = { include: callerInclude };
    if (include) {
        result = mergeIncludeSelect(result, {
            include: includeFromQuery(include),
        });
    }
    const convertedSelect = select ? convertSelect(select) : undefined;
    if (convertedSelect instanceof Object) {
        result = mergeIncludeSelect(result, { include: convertedSelect });
    }
    return result;
}
function mergeIncludeSelect(a, b) {
    const result = mergeIncludeSelectSub(a, b);
    return typeof result === "boolean" ? undefined : result;
}
function mergeIncludeSelectSub(a, b) {
    if (!a)
        return b;
    if (!b)
        return a;
    const { include: ainc, select: asel } = a instanceof Object ? a : {};
    const { include: binc, select: bsel } = b instanceof Object ? b : {};
    if (ainc && asel) {
        throw new Error(`can't provide both include and select`);
    }
    if (binc && bsel) {
        throw new Error(`can't provide both include and select`);
    }
    const incKeys = [...Object.keys(ainc || {}), ...Object.keys(binc || {})];
    const mustInclude = incKeys.length || a === true || b === true;
    if (mustInclude) {
        incKeys.push(...subselKeys(asel), ...subselKeys(bsel));
    }
    const selKeys = [...Object.keys(asel || {}), ...Object.keys(bsel || {})];
    const aobj = asel || ainc || {};
    const bobj = bsel || binc || {};
    const merged = {};
    if (mustInclude) {
        for (const key of incKeys) {
            const value = mergeIncludeSelectSub(aobj[key], bobj[key]);
            if (value != null)
                merged[key] = value;
        }
        return Object.keys(merged).length ? { include: merged } : true;
    }
    for (const key of selKeys) {
        const value = mergeIncludeSelectSub(aobj[key], bobj[key]);
        if (value != null)
            merged[key] = value;
    }
    return Object.keys(merged).length ? { select: merged } : null;
}
function* subselKeys(select) {
    if (!select)
        return;
    for (const key of Object.keys(select)) {
        const value = select[key];
        if (value instanceof Object && (value.select || value.include))
            yield key;
    }
}
const makePrismaPlugin = () => (stl) => {
    return {
        statics: {
            pagination: {
                wrapQuery,
                makeResponse,
            },
            paginate: paginate,
        },
        middleware(params, context) {
            const model = context.endpoint.response
                ? extractPrismaModel(context.endpoint.response)
                : null;
            function getModel() {
                if (!model)
                    throw new Error(`response doesn't have a prisma model configured`);
                return model;
            }
            function wrapQuery(prismaQuery) {
                return endpointWrapQuery(context.endpoint, context, prismaQuery);
            }
            const prismaContext = {
                prismaModel: model,
                wrapQuery,
                findUnique: (args) => getModel().findUnique(wrapQuery(args)),
                findUniqueOrThrow: (args) => getModel()
                    .findUniqueOrThrow(wrapQuery(args))
                    .catch((e) => {
                    console.error(e.stack);
                    throw new stainless_1.NotFoundError();
                }),
                findMany: (args) => getModel().findMany(wrapQuery(args)),
                create: (args) => getModel().create(wrapQuery(args)),
                update: (args) => getModel().update(wrapQuery(args)),
                delete: (args) => getModel().delete(wrapQuery(args)),
                paginate(args) {
                    var _a;
                    return __awaiter(this, void 0, void 0, function* () {
                        const query = ((_a = context.parsedParams) === null || _a === void 0 ? void 0 : _a.query) || {};
                        return makeResponse(query, yield prismaContext.findMany(args));
                    });
                },
            };
            context.prisma = prismaContext;
        },
    };
};
exports.makePrismaPlugin = makePrismaPlugin;
/**
 * Converts an include parameter from stainless format
 * e.g. `['user.comments', 'comments.user'] to prisma
 * include format e.g.
 * {
 *   user: { include: { comments: true } },
 *   comments: { include: { user: true } },
 * }
 */
function includeFromQuery(include) {
    const result = {};
    for (const path of include) {
        const parts = path.split(".");
        let prismaInclude = result;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!(prismaInclude[parts[i]] instanceof Object)) {
                const next = { include: {} };
                prismaInclude[parts[i]] = next;
                prismaInclude = next.include;
            }
        }
        prismaInclude[parts[parts.length - 1]] = true;
    }
    return result;
}
function convertSelect(tree) {
    const select = tree === null || tree === void 0 ? void 0 : tree.select;
    if (!select)
        return tree instanceof Object ? true : undefined;
    const result = {};
    for (let key of Object.keys(select)) {
        const converted = convertSelect(select[key]);
        key = key.replace(/_fields$/, "");
        if (converted instanceof Object)
            result[key] = { select: converted };
        else if (converted === true)
            result[key] = converted;
    }
    return result;
}
exports.PrismaModelSymbol = Symbol("PrismaModel");
class PrismaModel extends stainless_1.t.EffectlessSchema {
}
exports.PrismaModel = PrismaModel;
exports.PrismaModelLoaderSymbol = Symbol("PrismaModelLoader");
class PrismaModelLoader extends stainless_1.t.Effects {
}
exports.PrismaModelLoader = PrismaModelLoader;
//# sourceMappingURL=prismaPlugin.js.map