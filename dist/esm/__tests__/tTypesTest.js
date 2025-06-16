import * as z from "../z";
export const PrismaModelSymbol = Symbol("PrismaModel");
export class PrismaModel extends z.Schema {
}
export const PrismaModelLoaderSymbol = Symbol("PrismaModelLoader");
export class PrismaModelLoader extends z.Schema {
}
export function prismaModel(model) {
    return { stainless: { prismaModel: model } };
}
const prisma = {
    user: {
        findUniqueOrThrow(args) {
            return null;
        },
    },
};
class UserId extends PrismaModelLoader {
    constructor() {
        super(...arguments);
        this.model = prisma.user;
    }
}
class User extends PrismaModel {
    constructor() {
        super(...arguments);
        this.model = prisma.user;
    }
}
//# sourceMappingURL=tTypesTest.js.map