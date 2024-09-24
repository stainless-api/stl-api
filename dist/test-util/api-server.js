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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.config = exports.customBasePathApi = exports.nestedApi = exports.api = exports.mockFetchImplementation = void 0;
const stainless_1 = require("stainless");
const cat_api_1 = require("../test-util/cat-api");
const dog_api_1 = require("../test-util/dog-api");
const LongBasePath = __importStar(require("../test-util/long-base-path-api"));
const user_api_1 = require("../test-util/user-api");
const dog_treat_api_1 = require("../test-util/dog-treat-api");
function mockFetchImplementation(input, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const mockCat = { name: "Shiro", color: "black" };
        let payload;
        let update;
        const [url, _search] = input.toString().split("?");
        switch (`${options === null || options === void 0 ? void 0 : options.method} ${url}`) {
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
            case "GET /api/camelCase/kebab-case/v2/dogs":
                payload = [{ name: "Fido", color: "red" }];
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
            case "PATCH /api/dogs/fido!":
                return Promise.reject({ status: 500, message: "error message" });
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
exports.customBasePathApi = stl.api({
    basePath: LongBasePath.complicatedBasePath,
    resources: {
        dogs: LongBasePath.dogs,
    },
});
exports.config = { basePath: "/api" };
//# sourceMappingURL=api-server.js.map