import * as t from "../t";
export const PrismaModelSymbol = Symbol("PrismaModel");
export class PrismaModel extends t.EffectlessSchema {
}
export const PrismaModelLoaderSymbol = Symbol("PrismaModelLoader");
export class PrismaModelLoader extends t.Effects {
}
export class PathStringSchema extends t.Refine {
    refine(value) {
        return value.startsWith("/");
    }
}
export function prismaModel(model) {
    return { stainless: { prismaModel: model } };
}
const prismaUser = {
    findUniqueOrThrow(args) {
        return null;
    },
};
class UserId extends PrismaModelLoader {
    constructor() {
        super(...arguments);
        this.model = prismaUser;
    }
}
class User extends PrismaModel {
    constructor() {
        super(...arguments);
        this.model = prismaUser;
    }
}
class ToString extends t.Transform {
    transform(value) {
        return String(value);
    }
}
class ParseNumber extends t.Transform {
    transform(value) {
        return Number(value);
    }
}
class ShortString extends t.EffectlessSchema {
    constructor() {
        super(...arguments);
        this.max = 5;
    }
}
//# sourceMappingURL=tTypesTest.js.map