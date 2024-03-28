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
exports.dogs = void 0;
const stainless_1 = require("stainless");
const stl = new stainless_1.Stl({ plugins: {} });
const dog = stainless_1.z.object({
    name: stainless_1.z.string(),
    color: stainless_1.z.string(),
});
const dogPath = stainless_1.z.path({
    dogName: stainless_1.z.string(),
});
const createDogBody = stainless_1.z.body({
    name: stainless_1.z.string().trim(),
    color: stainless_1.z.string().trim(),
});
const listDogs = stl.endpoint({
    endpoint: "GET /api/dogs",
    response: dog.array(),
    handler: (_params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        return [
            { name: "Shiro", color: "black" },
            { name: "baby!", color: "black" },
        ];
    }),
});
const createDog = stl.endpoint({
    endpoint: "POST /api/dogs",
    body: createDogBody,
    response: dog,
    handler: (params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        return { name: params.name, color: params.color };
    }),
});
const retrieveDog = stl.endpoint({
    endpoint: "GET /api/dogs/{dogName}",
    path: dogPath,
    response: dog,
    handler: (params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        return { name: params.dogName, color: "black" };
    }),
});
const updateDog = stl.endpoint({
    endpoint: "PATCH /api/dogs/{dogName}",
    path: dogPath,
    body: createDogBody.partial(),
    response: dog,
    handler: (params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        return { name: params.dogName, color: "black" };
    }),
});
const retrieveLitter = stl.endpoint({
    endpoint: "GET /api/dogs/{dogName}/litter",
    path: dogPath,
    response: dog.array(),
    handler: (_params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        return [{ name: "baby!", color: "black" }];
    }),
});
exports.dogs = stl.resource({
    summary: "Dogs",
    actions: {
        list: listDogs,
        create: createDog,
        retrieve: retrieveDog,
        update: updateDog,
        retrieveLitter,
    },
});
//# sourceMappingURL=dog-api.js.map