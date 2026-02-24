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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = exports.convertPathToImport = exports.mangleRouteToIdentifier = exports.isSymbolStlMethod = exports.pathExists = exports.statOrExit = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const memoize_1 = __importDefault(require("lodash/memoize"));
const util_1 = require("util");
const resolve_1 = __importDefault(require("resolve"));
function statOrExit(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield fs_1.default.promises.stat(path);
        }
        catch (e) {
            console.error(`${e}.`);
            process.exit(1);
        }
    });
}
exports.statOrExit = statOrExit;
function pathExists(path) {
    return fs_1.default.promises.stat(path).then(() => true, () => false);
}
exports.pathExists = pathExists;
function isSymbolStlMethod(symbol) {
    const symbolDeclaration = symbol.getDeclarations()[0];
    if (!symbolDeclaration)
        return false;
    const symbolDeclarationFile = symbolDeclaration.getSourceFile().getFilePath();
    return symbolDeclarationFile.endsWith("stl.d.ts");
}
exports.isSymbolStlMethod = isSymbolStlMethod;
function mangleRouteToIdentifier(str) {
    let pathSep = "_";
    for (const match of str.matchAll(/_+/g)) {
        if (match.length >= pathSep.length)
            pathSep = match[0] + "_";
    }
    const unicodeLetterRegex = /\p{L}/u;
    const escapedStringBuilder = [];
    for (const codePointString of str) {
        if (codePointString === " ") {
            escapedStringBuilder.push("_");
        }
        else if (codePointString === "/") {
            escapedStringBuilder.push(pathSep);
        }
        else if (codePointString === "{" || codePointString === "}") {
            escapedStringBuilder.push("$");
        }
        else if (unicodeLetterRegex.test(codePointString)) {
            escapedStringBuilder.push(codePointString);
        }
        else {
            escapedStringBuilder.push(`$${codePointString.codePointAt(0)}`);
        }
    }
    return escapedStringBuilder.join("");
}
exports.mangleRouteToIdentifier = mangleRouteToIdentifier;
function absoluteNodeModulesPath(path) {
    const splitPath = path.split(path_1.default.sep);
    for (let i = 0; i < splitPath.length; i++) {
        if (splitPath[i] === "node_modules") {
            return path_1.default.join(...splitPath.slice(i + 1));
        }
    }
    return path;
}
function convertPathToImport(path) {
    const withAbsolute = absoluteNodeModulesPath(path);
    // strip extension from path
    // todo: we probably need to handle modules as well
    const { dir, name } = path_1.default.parse(withAbsolute);
    return path_1.default.join(dir, name);
}
exports.convertPathToImport = convertPathToImport;
exports.resolve = (0, memoize_1.default)((specifier, basedir) => __awaiter(void 0, void 0, void 0, function* () {
    // sometimes we'll be trying to resolve prettier for a codegen output dir
    // that doesn't exist yet
    while (!(yield pathExists(basedir))) {
        basedir = path_1.default.dirname(basedir);
    }
    return yield (0, util_1.promisify)((cb) => (0, resolve_1.default)(specifier, { basedir }, cb))();
}), (specifier, basedir) => JSON.stringify({ specifier, basedir }));
//# sourceMappingURL=utils.js.map