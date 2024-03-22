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
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeGeneratedTypes = void 0;
const fs_1 = require("fs");
const ReactQuery = __importStar(require("@tanstack/react-query"));
const generate_types_1 = require("../codegen/generate-types");
const path_1 = require("path");
const api_server_1 = require("../test-util/api-server");
function writeGeneratedTypes({ generatedDirName, outputFileName, installLocation, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const outputFile = yield (0, generate_types_1.generateOutput)(api_server_1.api, Object.assign(Object.assign({}, api_server_1.config), { extensions: { reactQuery: ReactQuery } }), installLocation);
        const generatedDirPath = (0, path_1.join)(process.cwd(), generatedDirName);
        const outputFilePath = (0, path_1.join)(generatedDirPath, outputFileName);
        console.log(`Generating API client types to ${outputFilePath}`);
        if (!(0, fs_1.existsSync)(generatedDirPath)) {
            (0, fs_1.mkdirSync)(generatedDirPath);
        }
        (0, fs_1.writeFileSync)(outputFilePath, outputFile);
    });
}
exports.writeGeneratedTypes = writeGeneratedTypes;
if (require.main === module) {
    const [_path, _pathToFile, dir, file, installLocation] = process.argv;
    writeGeneratedTypes({
        generatedDirName: dir,
        outputFileName: file,
        installLocation,
    });
}
//# sourceMappingURL=run-codegen.js.map