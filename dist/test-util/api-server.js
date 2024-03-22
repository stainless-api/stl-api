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
exports.config = exports.nestedApi = exports.api = exports.mockFetchImplementation = void 0;
const stainless_1 = require("stainless");
const cat_api_1 = require("../test-util/cat-api");
const dog_api_1 = require("../test-util/dog-api");
const user_api_1 = require("../test-util/user-api");
const dog_treat_api_1 = require("../test-util/dog-treat-api");
function mockFetchImplementation(input, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const mockCat = { name: "Shiro", color: "black" };
        let payload;
        let update;
        switch (`${options === null || options === void 0 ? void 0 : options.method} ${input}`) {
            case "GET /api/cats":
                payload = [mockCat];
                break;
            case "PATCH /api/cats/shiro":
                update = (options === null || options === void 0 ? void 0 : options.body) ? JSON.parse(options.body) : {};
                payload = Object.assign(Object.assign({}, mockCat), update);
                break;
            case "GET /api/dogs/fido/dogTreats":
            case "GET /api/dogs/fido/dog-treats":
                payload = [{ yummy: true }];
                break;
            case "GET /api/dogs":
                throw new Error("Expected to throw");
            case "PATCH /api/dogs/fido/dog-treats/treatId":
                update = (options === null || options === void 0 ? void 0 : options.body) ? JSON.parse(options.body) : {};
                payload = Object.assign({}, update);
                break;
            case "GET /api/dogs/fido/dog-treats/treatId":
            case "GET /api/dogs/fido/dogTreats/treatId":
                payload = { yummy: true };
                break;
            default:
                throw new Error(`Unmocked endpoint: ${options === null || options === void 0 ? void 0 : options.method} ${input}`);
        }
        return new Response(JSON.stringify(payload));
    });
}
exports.mockFetchImplementation = mockFetchImplementation;
const stl = new stainless_1.Stl({ plugins: {} });
exports.api = stl.api({
    basePath: "/api",
    resources: {
        cats: cat_api_1.cats,
        dogs: dog_api_1.dogs,
        dogTreats: dog_treat_api_1.dogTreats,
        users: user_api_1.users,
    },
});
exports.nestedApi = stl.api({
    basePath: "/api",
    resources: {
        cats: cat_api_1.cats,
        dogs: Object.assign(Object.assign({}, dog_api_1.dogs), { namespacedResources: {
                dogTreats: dog_treat_api_1.dogTreats,
            } }),
    },
});
exports.config = { basePath: "/api" };
//# sourceMappingURL=api-server.js.map