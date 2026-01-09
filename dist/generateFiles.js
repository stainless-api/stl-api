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
exports.generateImportStatements = exports.generatePath = exports.relativeImportPath = exports.generateFiles = void 0;
const lodash_1 = require("lodash");
const convertType_1 = require("./convertType");
const ts_morph_1 = require("ts-morph");
const { factory } = ts_morph_1.ts;
const Path = __importStar(require("path"));
function generateFiles(ctx, generationConfig) {
    const outputMap = new Map();
    for (const [path, info] of ctx.files.entries()) {
        (0, convertType_1.processModuleIdentifiers)(info);
        const generatedPath = generatePath(path, generationConfig);
        const tsPath = `${generatedPath}.ts`;
        // TODO: clean up by removing duplicate functions, rename function
        outputMap.set(tsPath, generateStatements(info, generationConfig, generatedPath));
    }
    return outputMap;
}
exports.generateFiles = generateFiles;
function generateStatements(info, generationConfig, generatedPath) {
    const statements = generateImportStatements(generationConfig, generatedPath, info.imports, info.namespaceImports, info.moduleIdentifiers);
    for (const schema of info.generatedSchemas.values()) {
        const declaration = factory.createVariableDeclaration(schema.name, undefined, schema.type || factory.createTypeReferenceNode("z.ZodTypeAny"), schema.expression);
        const variableStatement = factory.createVariableStatement(schema.isExported
            ? [factory.createToken(ts_morph_1.ts.SyntaxKind.ExportKeyword)]
            : [], factory.createVariableDeclarationList([declaration], ts_morph_1.ts.NodeFlags.Const));
        statements.push(variableStatement);
    }
    return statements;
}
function relativeImportPath(importingFile, importedFile) {
    let relativePath = Path.relative(Path.dirname(importingFile), importedFile);
    if (!relativePath.startsWith("."))
        relativePath = `./${relativePath}`;
    return relativePath;
}
exports.relativeImportPath = relativeImportPath;
/** Returns the path in which to generate schemas for an input path. Generates without a file extension. */
function generatePath(path, { basePath, baseDependenciesPath, rootPath, suffix }) {
    // set cwd to the root path for proper processing of relative paths
    // save old cwd to restore later
    // either basePath or baseDependenciesPath
    let chosenBasePath = basePath;
    if (path.match(/node_modules$/) != null) {
        chosenBasePath = baseDependenciesPath;
    }
    else if (suffix) {
        const parsedPath = Path.parse(path);
        path = Path.join(parsedPath.dir, `${parsedPath.name}.${suffix}${parsedPath.ext}`);
    }
    const pathWithExtension = Path.join(chosenBasePath, Path.relative(rootPath, path));
    const parsed = Path.parse(pathWithExtension);
    return Path.join(parsed.dir, parsed.name);
}
exports.generatePath = generatePath;
function generateImportGroups(imports, filePath, config) {
    return (0, lodash_1.groupBy)([...imports.entries()], ([_, { importFromUserFile, sourceFile }]) => relativeImportPath(filePath, importFromUserFile ? sourceFile : generatePath(sourceFile, config)));
}
function normalizeImport(relativePath) {
    // use absolute, not relative, imports for things in node_modules
    const nodeModulesPos = relativePath.lastIndexOf("node_modules");
    if (nodeModulesPos >= 0) {
        relativePath = relativePath.substring(nodeModulesPos + 13);
    }
    // strip extension like '.ts' off file
    const parsedRelativePath = Path.parse(relativePath);
    let extensionlessRelativePath = Path.join(parsedRelativePath.dir, parsedRelativePath.name);
    if (extensionlessRelativePath[0] !== "." && nodeModulesPos < 0) {
        extensionlessRelativePath = `./${extensionlessRelativePath}`;
    }
    return extensionlessRelativePath;
}
function generateImportStatements(config, filePath, imports, namespaceImports, moduleIdentifiers) {
    const zImportClause = factory.createImportClause(false, undefined, factory.createNamedImports([
        factory.createImportSpecifier(false, undefined, factory.createIdentifier("z")),
    ]));
    const zImportDeclaration = factory.createImportDeclaration([], zImportClause, factory.createStringLiteral(config.zPackage || "zod"));
    const importDeclarations = [zImportDeclaration];
    if (moduleIdentifiers) {
        const { userModules, generatedModules } = moduleIdentifiers;
        for (const [importPath, identifier] of userModules) {
            importDeclarations.push(generateModuleImportDeclaration(config, identifier.escapedText, filePath, importPath, true));
        }
        for (const [importPath, identifier] of generatedModules) {
            importDeclarations.push(generateModuleImportDeclaration(config, identifier.escapedText, filePath, importPath, false));
        }
        return importDeclarations;
    }
    const importGroups = generateImportGroups(imports, filePath, config);
    for (let [relativePath, entries] of Object.entries(importGroups)) {
        const importSpecifiers = entries.map(([name, { as }]) => {
            if (as === name)
                as = undefined;
            return factory.createImportSpecifier(false, as ? factory.createIdentifier(name) : undefined, factory.createIdentifier(as || name));
        });
        const importClause = factory.createImportClause(false, undefined, factory.createNamedImports(importSpecifiers));
        const normalizedImport = normalizeImport(relativePath);
        const importDeclaration = factory.createImportDeclaration(undefined, importClause, factory.createStringLiteral(normalizedImport), undefined);
        importDeclarations.push(importDeclaration);
    }
    for (const [name, info] of namespaceImports.entries()) {
        importDeclarations.push(generateModuleImportDeclaration(config, name, filePath, info.sourceFile, info.importFromUserFile));
    }
    return importDeclarations;
}
exports.generateImportStatements = generateImportStatements;
function generateModuleImportDeclaration(config, name, filePath, importPath, importFromUserFile) {
    const relativeImport = relativeImportPath(filePath, importFromUserFile ? importPath : generatePath(importPath, config));
    const normalizedImport = normalizeImport(relativeImport);
    const importClause = factory.createImportClause(false, undefined, factory.createNamespaceImport(factory.createIdentifier(name)));
    return factory.createImportDeclaration(undefined, importClause, factory.createStringLiteral(normalizedImport));
}
//# sourceMappingURL=generateFiles.js.map