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
const UserPath = z.path({
    id: z.string(),
});
const UpdateUserBody = z.body({
    name: z.string().trim().optional(),
    email: z.string().email().trim().optional(),
});
const User = z.object({
    id: z.string(),
    name: z.string().nullish(),
    email: z.string().nullish(),
    siteWideRole: z.enum(["admin", "user"]),
    githubUsername: z.string().nullish(),
    createAt: z.string(),
    updatedAt: z.string(),
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
export const users = stl.resource({
    summary: "Users",
    internal: true,
    actions: {
        update: updateUser,
    },
});
//# sourceMappingURL=user-api.js.map