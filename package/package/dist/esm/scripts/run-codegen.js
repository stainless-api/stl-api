var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { existsSync, mkdirSync, writeFileSync } from "fs";
import * as ReactQuery from "@tanstack/react-query";
import { generateOutput } from "../codegen/generate-types";
import { join } from "path";
import { api, config } from "../test-util/api-server";
export function writeGeneratedTypes({ generatedDirName, outputFileName, installLocation, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const outputFile = yield generateOutput(api, Object.assign(Object.assign({}, config), { extensions: { reactQuery: ReactQuery } }), installLocation);
        const generatedDirPath = join(process.cwd(), generatedDirName);
        const outputFilePath = join(generatedDirPath, outputFileName);
        console.log(`Generating API client types to ${outputFilePath}`);
        if (!existsSync(generatedDirPath)) {
            mkdirSync(generatedDirPath);
        }
        writeFileSync(outputFilePath, outputFile);
    });
}
if (require.main === module) {
    const [_path, _pathToFile, dir, file, installLocation] = process.argv;
    writeGeneratedTypes({
        generatedDirName: dir,
        outputFileName: file,
        installLocation,
    });
}
//# sourceMappingURL=run-codegen.js.map