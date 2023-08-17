#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { genApiRouteMap } from "../gen/genApiRouteMap.js";
import "ts-node/register/transpile-only";
import dedent from "dedent-js";
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
            console.error(dedent `
      Usage: gen-stl-api-route-map <api files>

      Options:
        -r, --require <path>      require the given path before loading api files
    `);
            process.exit(1);
        }
        for (const require of requires) {
            yield import(require);
        }
        for (const file of files) {
            yield genApiRouteMap(file);
        }
    });
}
go();
//# sourceMappingURL=gen-stl-api-route-map.js.map