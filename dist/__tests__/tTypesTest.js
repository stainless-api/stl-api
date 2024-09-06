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
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaModel = exports.PrismaModelLoader = exports.PrismaModelLoaderSymbol = exports.PrismaModel = exports.PrismaModelSymbol = void 0;
const z = __importStar(require("../z"));
exports.PrismaModelSymbol = Symbol("PrismaModel");
class PrismaModel extends z.Schema {
}
exports.PrismaModel = PrismaModel;
exports.PrismaModelLoaderSymbol = Symbol("PrismaModelLoader");
class PrismaModelLoader extends z.Schema {
}
exports.PrismaModelLoader = PrismaModelLoader;
function prismaModel(model) {
    return { stainless: { prismaModel: model } };
}
exports.prismaModel = prismaModel;
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