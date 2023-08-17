#!/usr/bin/env node
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
const genApiRouteMap_js_1 = require("../gen/genApiRouteMap.js");
require("ts-node/register/transpile-only");
const dedent_js_1 = __importDefault(require("dedent-js"));
function go() {
    return __awaiter(this, void 0, void 0, function* () {
        const requires = [];
        const files = [];
        for (let i = 2; i < process.argv.length; i++) {
            const arg = process.argv[i];
            if (arg === "-r" || arg === "--require") {
                i++;
                if (i >= process.argv.length) {
                    throw new Error(`missing module path for ${arg} option`);
                }
                requires.push(process.argv[i]);
            }
            else {
                files.push(process.argv[i]);
            }
        }
        if (!files.length) {
            // eslint-disable-next-line no-console
            console.error((0, dedent_js_1.default) `
      Usage: gen-stl-api-route-map <api files>

      Options:
        -r, --require <path>      require the given path before loading api files
    `);
            process.exit(1);
        }
        for (const require of requires) {
            yield Promise.resolve(`${require}`).then(s => __importStar(require(s)));
        }
        for (const file of files) {
            yield (0, genApiRouteMap_js_1.genApiRouteMap)(file);
        }
    });
}
go();
//# sourceMappingURL=gen-stl-api-route-map.js.map