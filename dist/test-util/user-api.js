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
exports.users = void 0;
const stainless_1 = require("stainless");
const stl = new stainless_1.Stl({ plugins: {} });
const UserPath = stainless_1.z.path({
    id: stainless_1.z.string(),
});
const UpdateUserBody = stainless_1.z.body({
    name: stainless_1.z.string().trim().optional(),
    email: stainless_1.z.string().email().trim().optional(),
});
const User = stainless_1.z.object({
    id: stainless_1.z.string(),
    name: stainless_1.z.string().nullish(),
    email: stainless_1.z.string().nullish(),
    siteWideRole: stainless_1.z.enum(["admin", "user"]),
    githubUsername: stainless_1.z.string().nullish(),
    createAt: stainless_1.z.string(),
    updatedAt: stainless_1.z.string(),
});
const updateUser = stl.endpoint({
    endpoint: "POST /api/users/{id}",
    path: UserPath,
    body: UpdateUserBody,
    response: User,
    handler: ({ id: userId, email, name }, context) => __awaiter(void 0, void 0, void 0, function* () {
        return {};
    }),
});
exports.users = stl.resource({
    summary: "Users",
    internal: true,
    actions: {
        update: updateUser,
    },
});
//# sourceMappingURL=user-api.js.map