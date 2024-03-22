var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Stl } from "stainless";
import { cats } from "../test-util/cat-api";
import { dogs } from "../test-util/dog-api";
import { users } from "../test-util/user-api";
import { dogTreats } from "../test-util/dog-treat-api";
export function mockFetchImplementation(input, options) {
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
const stl = new Stl({ plugins: {} });
export const api = stl.api({
    basePath: "/api",
    resources: {
        cats,
        dogs,
        dogTreats,
        users,
    },
});
export const nestedApi = stl.api({
    basePath: "/api",
    resources: {
        cats,
        dogs: Object.assign(Object.assign({}, dogs), { namespacedResources: {
                dogTreats,
            } }),
    },
});
export const config = { basePath: "/api" };
//# sourceMappingURL=api-server.js.map