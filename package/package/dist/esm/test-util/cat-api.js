var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Stl, z } from "stainless";
const stl = new Stl({ plugins: {} });
const cat = z.object({
    name: z.string(),
    color: z.string(),
});
const catPath = z.path({
    catName: z.string(),
});
const createCatBody = z.body({
    name: z.string().trim(),
    color: z.string().trim(),
});
const listCats = stl.endpoint({
    endpoint: "GET /api/cats",
    response: cat.array(),
    handler: (_params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        return [
            { name: "Shiro", color: "black" },
            { name: "baby!", color: "black" },
        ];
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
export const cats = stl.resource({
    summary: "Cats",
    actions: {
        list: listCats,
        create: createCat,
        update: updateCat,
        retrieve: retrieveCat,
        retrieveLitter,
    },
});
export const catApi = stl.api({
    basePath: "/api",
    resources: {
        cats,
    },
});
//# sourceMappingURL=cat-api.js.map