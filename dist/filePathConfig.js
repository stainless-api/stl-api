"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGenerationConfig = void 0;
const path_1 = __importDefault(require("path"));
const DEFAULT_ALONGSIDE_SUFFIX = "codegen";
function createGenerationConfig(options) {
    let basePath;
    let baseDependenciesPath;
    let suffix;
    switch (options.genLocation.type) {
        case "alongside":
            basePath = options.rootPath;
            baseDependenciesPath = path_1.default.join(basePath, options.genLocation.dependencyGenPath);
            suffix = options.genLocation.suffix || DEFAULT_ALONGSIDE_SUFFIX;
            break;
        case "folder":
            basePath = path_1.default.join(options.rootPath, options.genLocation.genPath);
            baseDependenciesPath = path_1.default.join(basePath, "zod_schema_node_modules");
            break;
    }
    return {
        basePath,
        baseDependenciesPath,
        suffix,
        rootPath: options.rootPath,
        zPackage: options.zPackage,
        moduleType: options.moduleType || "commonjs",
    };
}
exports.createGenerationConfig = createGenerationConfig;
//# sourceMappingURL=filePathConfig.js.map