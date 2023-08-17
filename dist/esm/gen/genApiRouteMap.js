var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from "path";
import { isAPIDescription } from "../stl.js";
import { getApiRouteMap } from "./getApiRouteMap.js";
import "../util/fetch-polyfill.js";
export function genApiRouteMap(apiSourceFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const metadataFile = apiSourceFile.replace(/(\.[^.]+)$/, `-route-map$1`);
        if (metadataFile === apiSourceFile)
            return;
        const loaded = yield import(apiSourceFile.startsWith("./") ? apiSourceFile : path.resolve(apiSourceFile));
        const metadata = [];
        for (const key of Object.keys(loaded)) {
            const api = loaded[key];
            if (isAPIDescription(api)) {
                metadata.push([key, getApiRouteMap(api)]);
            }
        }
        if (!metadata.length)
            return;
        const fs = yield import(/* webpackIgnore */ "fs/promises");
        yield fs.writeFile(metadataFile, [
            'import { APIRouteMap } from "stainless";',
            ...metadata.map(([name, metadata]) => `export const ${name}: APIRouteMap = ${JSON.stringify(metadata, null, 2)};`),
        ].join("\n\n"), "utf8");
        console.error(`wrote ${path.relative(process.cwd(), metadataFile)}`);
    });
}
//# sourceMappingURL=genApiRouteMap.js.map