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
Object.defineProperty(exports, "__esModule", { value: true });
exports.catApi = exports.cats = void 0;
const stainless_1 = require("stainless");
const stl = new stainless_1.Stl({ plugins: {} });
const colorEnum = {
    red: "red",
    blue: "blue",
    black: "black",
    white: "white",
};
const color = stainless_1.z.nativeEnum(colorEnum);
const cat = stainless_1.z.object({
    name: stainless_1.z.string(),
    color: color,
});
const catPath = stainless_1.z.path({
    catName: stainless_1.z.string(),
});
const createCatBody = stainless_1.z.body({
    name: stainless_1.z.string().trim(),
    color: color,
});
const CatQuery = stainless_1.z.object({
    color: color,
});
const listCats = stl.endpoint({
    endpoint: "GET /api/cats",
    response: cat.array(),
    query: CatQuery,
    handler: (params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        const cats = [
            { name: "Shiro", color: "black" },
            { name: "baby!", color: "black" },
            { name: "baby!", color: "white" },
            { name: "baby!", color: "red" },
        ];
        if (params.color) {
            return cats.filter((cat) => cat.color === params.color);
        }
        return cats;
    }),
});
const createCat = stl.endpoint({
    endpoint: "POST /api/cats",
    body: createCatBody,
    response: cat,
    handler: (params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        return { name: params.name, color: params.color };
    }),
});
const retrieveCat = stl.endpoint({
    endpoint: "GET /api/cats/{catName}",
    path: catPath,
    response: cat,
    handler: (params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        return { name: params.catName, color: "black" };
    }),
});
const updateCat = stl.endpoint({
    endpoint: "PATCH /api/cats/{catName}",
    path: catPath,
    body: createCatBody.partial(),
    response: cat,
    handler: (params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        return { name: params.catName, color: "black" };
    }),
});
const retrieveLitter = stl.endpoint({
    endpoint: "GET /api/cats/{catName}/litter",
    path: catPath,
    response: cat.array(),
    handler: (_params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        return [{ name: "baby!", color: "black" }];
    }),
});
exports.cats = stl.resource({
    summary: "Cats",
    actions: {
        list: listCats,
        create: createCat,
        update: updateCat,
        retrieve: retrieveCat,
        retrieveLitter,
    },
});
exports.catApi = stl.api({
    basePath: "/api",
    resources: {
        cats: exports.cats,
    },
});
//# sourceMappingURL=cat-api.js.map