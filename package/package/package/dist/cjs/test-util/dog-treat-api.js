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
exports.dogTreats = void 0;
const stainless_1 = require("stainless");
const stl = new stainless_1.Stl({ plugins: {} });
const dogPath = stainless_1.z.path({
    dogName: stainless_1.z.string(),
});
const dogTreat = stainless_1.z.object({
    yummy: stainless_1.z.boolean(),
});
const getDogTreat = stl.endpoint({
    endpoint: "GET /api/dogs/{dogName}/dog-treats",
    path: dogPath,
    response: dogTreat,
    handler: (_params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        return { yummy: true };
    }),
});
exports.dogTreats = stl.resource({
    summary: "Dog Treats",
    actions: {
        get: getDogTreat,
    },
});
//# sourceMappingURL=dog-treat-api.js.map