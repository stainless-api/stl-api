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
exports.makeNextAuthPlugin = void 0;
const http_1 = require("http");
const next_auth_1 = require("next-auth");
const makeNextAuthPlugin = ({ authOptions }) => (stl) => ({
    middleware(endpoint, params, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { args: [req, res], } = requireNextServerContext(context);
            // TODO catch invalid credentials errors,
            // send appropriate error response,
            // and somehow signal to stl.execute to early
            // exit
            if (req instanceof http_1.IncomingMessage && res instanceof http_1.ServerResponse) {
                context.session = yield (0, next_auth_1.getServerSession)(req, res, authOptions);
            }
            else {
                context.session = yield (0, next_auth_1.getServerSession)(authOptions);
            }
        });
    },
});
exports.makeNextAuthPlugin = makeNextAuthPlugin;
function requireNextServerContext(context) {
    context.prisma;
    const { server } = context;
    if ((server === null || server === void 0 ? void 0 : server.type) !== "nextjs") {
        throw new Error("next-auth plugin only works with nextjs server plugin");
    }
    return server;
}
//# sourceMappingURL=nextAuthPlugin.js.map