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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genApiRouteMap = void 0;
const path_1 = __importDefault(require("path"));
const stl_1 = require("../stl");
const getApiRouteMap_1 = require("./getApiRouteMap");
require("../util/fetch-polyfill");
function genApiRouteMap(apiSourceFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const metadataFile = apiSourceFile.replace(/(\.[^.]+)$/, `-route-map$1`);
        if (metadataFile === apiSourceFile)
            return;
        const loaded = yield Promise.resolve(`${apiSourceFile.startsWith("./") ? apiSourceFile : path_1.default.resolve(apiSourceFile)}`).then(s => __importStar(require(s)));
        const metadata = [];
        for (const key of Object.keys(loaded)) {
            const api = loaded[key];
            if ((0, stl_1.isAPIDescription)(api)) {
                metadata.push([key, (0, getApiRouteMap_1.getApiRouteMap)(api)]);
            }
        }
        if (!metadata.length)
            return;
        const fs = yield Promise.resolve().then(() => __importStar(require(/* webpackIgnore */ "fs/promises")));
        yield fs.writeFile(metadataFile, [
            'import { APIRouteMap } from "stainless";',
            ...metadata.map(([name, metadata]) => `export const ${name}: APIRouteMap = ${JSON.stringify(metadata, null, 2)};`),
        ].join("\n\n"), "utf8");
        console.error(`wrote ${path_1.default.relative(process.cwd(), metadataFile)}`);
    });
}
exports.genApiRouteMap = genApiRouteMap;
//# sourceMappingURL=genApiRouteMap.js.map