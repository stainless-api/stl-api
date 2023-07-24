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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tm = __importStar(require("ts-morph"));
const ts_morph_1 = require("ts-morph");
const { factory } = ts_morph_1.ts;
const pkg_up_1 = __importDefault(require("pkg-up"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const ts_to_zod_1 = require("ts-to-zod");
const convertType_1 = require("ts-to-zod/dist/convertType");
const generateFiles_1 = require("ts-to-zod/dist/generateFiles");
const filePathConfig_1 = require("ts-to-zod/dist/filePathConfig");
const watch_1 = require("./watch");
const endpointPreprocess_1 = require("./endpointPreprocess");
const commander_1 = require("commander");
const utils_1 = require("./utils");
const format_1 = require("./format");
// TODO: add dry run functionality?
commander_1.program.option("-w, --watch", "enables watch mode");
commander_1.program
    .option("-d, --directory <path>", "the directory to generate schemas for", ".")
    .allowExcessArguments(false);
const FOLDER_GEN_PATH = ".stl-codegen";
function main() {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        commander_1.program.parse();
        const options = commander_1.program.opts();
        const directoryStat = yield (0, utils_1.statOrExit)(options.directory);
        if (!directoryStat.isDirectory()) {
            console.error(`Error: '${options.directory} is not a directory.`);
            process.exit(1);
        }
        const packageJsonPath = yield (0, pkg_up_1.default)({
            cwd: options.directory,
        });
        if (!packageJsonPath) {
            console.error(`Folder ${path_1.default.relative(".", options.directory)} and its parent directories do not contain a package.json.`);
            process.exit(1);
        }
        const rootPath = path_1.default.dirname(packageJsonPath);
        const tsConfigFilePath = path_1.default.relative(".", path_1.default.join(rootPath, "tsconfig.json"));
        const tsConfigStat = yield (0, utils_1.statOrExit)(tsConfigFilePath);
        if (!tsConfigStat.isFile()) {
            console.error(`Error: '${tsConfigFilePath}' is not a file.`);
        }
        const generationOptions = {
            genLocation: {
                type: "folder",
                genPath: FOLDER_GEN_PATH,
            },
            rootPath,
            zPackage: "stainless",
        };
        const generationConfig = (0, filePathConfig_1.createGenerationConfig)(generationOptions);
        let watcher;
        if (options.watch) {
            watcher = new watch_1.Watcher(rootPath, generationConfig.basePath);
        }
        const project = (watcher === null || watcher === void 0 ? void 0 : watcher.project) ||
            new tm.Project({
                // TODO: should file path be configurable?
                tsConfigFilePath,
            });
        const baseCtx = new convertType_1.SchemaGenContext(project);
        const printer = tm.ts.createPrinter();
        const succeeded = yield evaluate(project, baseCtx, generationConfig, rootPath, printer);
        if (watcher) {
            try {
                for (var _d = true, _e = __asyncValues(watcher.getEvents()), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const { path } = _c;
                    console.clear();
                    const relativePath = path_1.default.relative(".", path);
                    console.log(`Found change in ${relativePath}.`);
                    const succeeded = yield evaluate(watcher.project, watcher.baseCtx, generationConfig, rootPath, printer);
                    if (succeeded) {
                        console.clear();
                        console.log(`Successfully processed ${relativePath}.`);
                    }
                    console.log("Watching for file changes...");
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        else if (!succeeded) {
            process.exit(1);
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield main();
}))()
    .then()
    .catch(console.log);
function generateIncidentLocation(filePath, incident) {
    const position = incident.position
        ? `${incident.position.startLine}:${incident.position.startColumn}:`
        : "";
    return chalk_1.default.gray(`${filePath}:${position}`);
}
/** returns true on successful generation of files, false otherwise */
function evaluate(project, baseCtx, generationConfig, rootPath, printer) {
    return __awaiter(this, void 0, void 0, function* () {
        // accumulated diagnostics to emit
        const callDiagnostics = [];
        // every stl.types.endpoint call found per file
        const endpointCalls = new Map();
        // a list of closures to call to modify the file before saving it
        // performs modifications that invalidate ast information after
        // all tree visiting is complete
        const fileOperations = [];
        for (const file of project.getSourceFiles()) {
            const ctx = new convertType_1.ConvertTypeContext(baseCtx, file);
            const imports = new Map();
            const namespacedImports = new Map();
            let hasMagicCall = false;
            for (const callExpression of file.getDescendantsOfKind(ts_morph_1.ts.SyntaxKind.CallExpression)) {
                ctx.generateInUserFile = false;
                const receiverExpression = callExpression.getExpression();
                const symbol = receiverExpression.getSymbol();
                if (!symbol || !(0, utils_1.isSymbolStlMethod)(symbol))
                    continue;
                const methodName = symbol.getEscapedName();
                if (!(methodName === "magic" || methodName === "endpoint"))
                    continue;
                if (methodName == "endpoint") {
                    const call = (0, endpointPreprocess_1.preprocessEndpoint)(callExpression);
                    if (!call)
                        continue;
                    const fileCalls = getOrInsert(endpointCalls, file, () => []);
                    let endpointSchema;
                    try {
                        endpointSchema = convertEndpointCall(ctx, call, file, callDiagnostics);
                    }
                    catch (e) {
                        if (e instanceof convertType_1.ErrorAbort) {
                            break;
                        }
                        else
                            throw e;
                    }
                    finally {
                        addDiagnostics(ctx, file, callExpression, callDiagnostics);
                    }
                    fileCalls.push({
                        endpointPath: call.endpointPath,
                        schemaExpression: endpointSchema,
                    });
                    const ctxFile = getOrInsert(ctx.files, file.getFilePath(), () => ({
                        imports: new Map(),
                        generatedSchemas: new Map(),
                    }));
                    const name = (0, utils_1.mangleRouteToIdentifier)(call.endpointPath);
                    ctxFile.generatedSchemas.set(name, {
                        name,
                        expression: endpointSchema,
                        isExported: true,
                        /** non-user-visible value should not be generated in .d.ts */
                        private: true,
                        type: factory.createTypeReferenceNode("any"),
                    });
                    continue;
                }
                // Handle stl.magic call
                const typeRefArguments = callExpression.getTypeArguments();
                if (typeRefArguments.length != 1)
                    continue;
                hasMagicCall = true;
                const [typeArgument] = typeRefArguments;
                const type = typeArgument.getType();
                let schemaExpression;
                ctx.isRoot = true;
                ctx.diagnostics = new Map();
                const diagnosticItem = {
                    variant: "node",
                    node: typeArgument,
                };
                if (typeArgument instanceof tm.TypeReferenceNode &&
                    typeArgument.getTypeArguments().length === 0) {
                    const symbol = typeArgument.getTypeName().getSymbolOrThrow();
                    try {
                        (0, convertType_1.convertSymbol)(ctx, symbol, diagnosticItem);
                    }
                    catch (e) {
                        if (e instanceof convertType_1.ErrorAbort)
                            break;
                        else
                            throw e;
                    }
                    finally {
                        addDiagnostics(ctx, file, callExpression, callDiagnostics);
                    }
                    const name = symbol.getName();
                    const declaration = symbol.getDeclarations()[0];
                    const declarationFilePath = declaration.getSourceFile().getFilePath();
                    if (declarationFilePath === file.getFilePath()) {
                        imports.set(symbol.getName(), {
                            as: `${name}Schema`,
                            sourceFile: declarationFilePath,
                        });
                    }
                    const schemaName = `${name}Schema`;
                    schemaExpression = factory.createIdentifier(schemaName);
                }
                else {
                    try {
                        ctx.generateInUserFile = true;
                        schemaExpression = (0, ts_to_zod_1.convertType)(ctx, type, diagnosticItem);
                    }
                    catch (e) {
                        if (e instanceof convertType_1.ErrorAbort)
                            break;
                        else
                            throw e;
                    }
                    finally {
                        addDiagnostics(ctx, file, callExpression, callDiagnostics);
                    }
                }
                // remove all arguments to magic function
                for (let argumentLength = callExpression.getArguments().length; argumentLength > 0; argumentLength--) {
                    fileOperations.push(() => callExpression.removeArgument(argumentLength - 1));
                }
                // fill in generated schema expression
                fileOperations.push(() => callExpression.addArgument(printer.printNode(ts_morph_1.ts.EmitHint.Unspecified, schemaExpression, file.compilerNode)));
            }
            const fileInfo = ctx.files.get(file.getFilePath());
            if (fileInfo) {
                (0, convertType_1.processModuleIdentifiers)(fileInfo);
            }
            if (!hasMagicCall)
                continue;
            // Get the imports needed for the current file, any
            if (fileInfo) {
                for (const [name, importInfo] of fileInfo.imports) {
                    // Don't include imports that would import from the file we're
                    // currently processing. This is relevant when handling enums and
                    // classes.
                    // TODO: is handling multiple declarations relevant here?
                    if (!importInfo.excludeFromUserFile) {
                        imports.set(name, Object.assign(Object.assign({}, importInfo), { importFromUserFile: false }));
                    }
                }
            }
            // add new imports necessary for schema generation
            let importDeclarations = (0, generateFiles_1.generateImportStatements)(generationConfig, file.getFilePath(), imports, namespacedImports);
            let hasZImport = false;
            // remove all existing codegen imports
            const fileImportDeclarations = file.getImportDeclarations();
            for (const importDecl of fileImportDeclarations) {
                const sourcePath = importDecl.getModuleSpecifier().getLiteralValue();
                if (sourcePath.indexOf(FOLDER_GEN_PATH) >= 0) {
                    fileOperations.push(() => importDecl.remove());
                }
                else if (sourcePath === "stainless") {
                    for (const specifier of importDecl.getNamedImports()) {
                        if (specifier.getName() === "z") {
                            hasZImport = true;
                        }
                    }
                }
            }
            // don't import "z" if it's already imported in the file
            if (hasZImport) {
                importDeclarations = importDeclarations.slice(1);
            }
            const importsString = importDeclarations
                .map((declaration) => printer.printNode(ts_morph_1.ts.EmitHint.Unspecified, declaration, file.compilerNode))
                .join("\n");
            // Insert imports after the last import already in the file.
            const insertPosition = fileImportDeclarations.length;
            fileOperations.push(() => file.insertStatements(insertPosition, importsString ? importsString + "\n" : ""));
        }
        // Commit all operations potentially destructive to AST visiting.
        fileOperations.forEach((op) => op());
        const generatedFileContents = (0, generateFiles_1.generateFiles)(baseCtx, generationConfig);
        if (callDiagnostics.length) {
            const output = [];
            let errorCount = 0;
            let warningCount = 0;
            for (const { filePath, line, column, diagnostics } of callDiagnostics) {
                output.push(chalk_1.default.magenta(`While processing magic call at ${path_1.default.relative(".", filePath)}:${line}:${column}:`));
                for (const [filePath, fileDiagnostics] of diagnostics) {
                    errorCount += fileDiagnostics.errors.length;
                    warningCount += fileDiagnostics.warnings.length;
                    for (const warning of fileDiagnostics.warnings) {
                        output.push(generateIncidentLocation(path_1.default.relative(".", filePath), warning));
                        output.push(chalk_1.default.yellow("warning: ") +
                            warning.message +
                            generateDiagnosticDetails(warning));
                    }
                    for (const error of fileDiagnostics.errors) {
                        output.push(generateIncidentLocation(path_1.default.relative(".", filePath), error));
                        output.push(chalk_1.default.red("error: ") +
                            error.message +
                            generateDiagnosticDetails(error));
                    }
                }
            }
            let diagnosticSummary;
            if (errorCount > 0 && warningCount > 0) {
                diagnosticSummary =
                    "Encountered " +
                        chalk_1.default.red(`${errorCount} error${errorCount === 1 ? "" : "s"} `) +
                        "and " +
                        chalk_1.default.yellow(`${warningCount} warning${warningCount === 1 ? "" : "s"}`) +
                        ".";
            }
            else if (errorCount > 0) {
                diagnosticSummary =
                    "Encountered " +
                        chalk_1.default.red(`${errorCount} error${errorCount === 1 ? "" : "s"}`) +
                        ".";
            }
            else {
                diagnosticSummary =
                    "Encountered " +
                        chalk_1.default.yellow(`${warningCount} warning${warningCount === 1 ? "" : "s"}`) +
                        ".";
            }
            for (const line of output) {
                console.log(line);
            }
            console.log();
            console.log(diagnosticSummary);
            if (errorCount > 0) {
                console.log("No modifications were made to package source.");
                return false;
            }
        }
        // Generate index.ts
        if (endpointCalls.size) {
            const mapEntries = [];
            const endpointMapGenPath = path_1.default.join(generationConfig.basePath, "index.ts");
            for (const [file, calls] of endpointCalls) {
                for (const call of calls) {
                    const mangledName = (0, utils_1.mangleRouteToIdentifier)(call.endpointPath);
                    const importExpression = factory.createCallExpression(factory.createToken(ts_morph_1.ts.SyntaxKind.ImportKeyword), undefined, [
                        factory.createStringLiteral(`${(0, generateFiles_1.relativeImportPath)(endpointMapGenPath, (0, utils_1.convertPathToImport)((0, generateFiles_1.generatePath)(file.getFilePath(), generationConfig)))}.js`),
                    ]);
                    const callExpression = factory.createCallExpression(factory.createPropertyAccessExpression(importExpression, "then"), undefined, [
                        factory.createArrowFunction(undefined, undefined, [factory.createParameterDeclaration(undefined, undefined, "mod")], undefined, undefined, factory.createPropertyAccessExpression(factory.createIdentifier("mod"), mangledName)),
                    ]);
                    const entry = factory.createPropertyAssignment(factory.createStringLiteral(call.endpointPath), createThunk(callExpression));
                    mapEntries.push(entry);
                }
            }
            const mapDeclaration = factory.createVariableDeclarationList([
                factory.createVariableDeclaration("typeSchemas", undefined, undefined, factory.createObjectLiteralExpression(mapEntries)),
            ], ts_morph_1.ts.NodeFlags.Const);
            const mapStatement = factory.createVariableStatement([factory.createToken(ts_morph_1.ts.SyntaxKind.ExportKeyword)], mapDeclaration);
            const mapSourceFile = factory.createSourceFile([mapStatement], factory.createToken(ts_morph_1.ts.SyntaxKind.EndOfFileToken), 0);
            yield fs_1.default.promises.mkdir(generationConfig.basePath, { recursive: true });
            yield fs_1.default.promises.writeFile(endpointMapGenPath, yield (0, format_1.format)(printer.printFile(mapSourceFile), endpointMapGenPath));
        }
        for (const [file, fileStatments] of generatedFileContents) {
            const fileDir = path_1.default.dirname(file);
            // creates directory where to write file to, if it doesn't already exist
            yield fs_1.default.promises.mkdir(fileDir, {
                recursive: true,
            });
            const sourceFile = factory.createSourceFile(fileStatments, factory.createToken(ts_morph_1.ts.SyntaxKind.EndOfFileToken), 0);
            // write sourceFile to file
            yield fs_1.default.promises.writeFile(file, yield (0, format_1.format)(printer.printFile(sourceFile), file));
        }
        project.save();
        return true;
    });
}
function generateDiagnosticDetails({ position, name, typeText, propertyName, }) {
    let typeDescriptor;
    if (typeText && (!name || name === "__type"))
        typeDescriptor = typeText;
    else
        typeDescriptor = name;
    if (typeDescriptor && propertyName) {
        return (0, chalk_1.default) `\nin type of property {cyan \`${propertyName}\`} of type {cyan \`${typeDescriptor}\`}`;
    }
    else if (name) {
        return (0, chalk_1.default) `\nwhile processing type {cyan \`${typeDescriptor}\`}`;
    }
    else if (position) {
        return "";
    }
    else
        return "at an unknown location";
}
function addDiagnostics(ctx, file, callExpression, callDiagnostics) {
    if (ctx.diagnostics.size) {
        const { line, column } = file.getLineAndColumnAtPos(callExpression.getStart());
        callDiagnostics.push({
            diagnostics: ctx.diagnostics,
            line,
            column,
            filePath: file.getFilePath(),
        });
    }
}
function convertEndpointType(ctx, callExpression, callDiagnostics, diagnosticsFile, typeArgument, type) {
    const diagnosticItem = {
        variant: "node",
        node: typeArgument,
    };
    if (typeArgument instanceof tm.TypeReferenceNode &&
        typeArgument.getTypeArguments().length === 0) {
        const symbol = typeArgument.getTypeName().getSymbolOrThrow();
        const schema = (0, convertType_1.convertSymbol)(ctx, symbol, diagnosticItem, type);
        addDiagnostics(ctx, diagnosticsFile, callExpression, callDiagnostics);
        return schema;
    }
    else {
        const schema = (0, ts_to_zod_1.convertType)(ctx, type, diagnosticItem);
        addDiagnostics(ctx, diagnosticsFile, callExpression, callDiagnostics);
        return schema;
    }
}
function convertEndpointCall(ctx, call, file, callDiagnostics) {
    const objectProperties = [];
    const requestTypes = [
        ["query", call.query],
        ["path", call.path],
        ["body", call.body],
    ].filter(([_, type]) => type);
    for (const [name, nodeType] of requestTypes) {
        const schemaExpression = convertEndpointType(ctx, call.callExpression, callDiagnostics, file, nodeType[0], nodeType[1]);
        objectProperties.push(factory.createPropertyAssignment(name, schemaExpression));
    }
    let schemaExpression;
    if (call.response) {
        schemaExpression = convertEndpointType(ctx, call.callExpression, callDiagnostics, file, call.response[0], call.response[1]);
    }
    else {
        // if no response type is provided, use the default schema z.void() to indicate no response
        schemaExpression = factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("z"), "void"), [], []);
    }
    objectProperties.push(factory.createPropertyAssignment("response", schemaExpression));
    return factory.createObjectLiteralExpression(objectProperties);
}
function getOrInsert(map, key, create) {
    let value = map.get(key);
    if (!value) {
        value = create();
        map.set(key, value);
    }
    return value;
}
function createThunk(expression) {
    return factory.createArrowFunction(undefined, undefined, [], undefined, undefined, expression);
}
//# sourceMappingURL=index.js.map