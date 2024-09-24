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
exports.dogs = exports.complicatedBasePath = void 0;
const stainless_1 = require("stainless");
exports.complicatedBasePath = "/api/camelCase/kebab-case/v2";
const stl = new stainless_1.Stl({ plugins: {} });
const dog = stainless_1.z.object({
    name: stainless_1.z.string(),
    color: stainless_1.z.string(),
});
const listDogs = stl.endpoint({
    endpoint: `GET ${exports.complicatedBasePath}/dogs`,
    response: dog.array(),
    handler: (_params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        return [
            { name: "Shiro", color: "black" },
            { name: "baby!", color: "black" },
        ];
    }),
});
exports.dogs = stl.resource({
    summary: "Dogs",
    actions: {
        list: listDogs,
    },
});
//# sourceMappingURL=long-base-path-api.js.map