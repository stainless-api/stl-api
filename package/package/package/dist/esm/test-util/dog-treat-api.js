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
const dogPath = z.path({
    dogName: z.string(),
});
const dogTreat = z.object({
    yummy: z.boolean(),
});
const getDogTreat = stl.endpoint({
    endpoint: "GET /api/dogs/{dogName}/dog-treats",
    path: dogPath,
    response: dogTreat,
    handler: (_params, _context) => __awaiter(void 0, void 0, void 0, function* () {
        return { yummy: true };
    }),
});
export const dogTreats = stl.resource({
    summary: "Dog Treats",
    actions: {
        get: getDogTreat,
    },
});
//# sourceMappingURL=dog-treat-api.js.map