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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyDeclaration = exports.getDeclaration = exports.getTypeFilePath = exports.isDeclarationExported = exports.methodCall = exports.convertType = exports.convertSymbol = exports.prefixValueWithModule = exports.processModuleIdentifiers = exports.isDeclarationImported = exports.ConvertTypeContext = exports.SchemaGenContext = exports.ErrorAbort = void 0;
const ts_morph_1 = require("ts-morph");
const { factory } = ts_morph_1.ts;
const tm = __importStar(require("ts-morph"));
const lodash_1 = require("lodash");
const path_1 = __importDefault(require("path"));
const typeSchemaUtils_1 = require("./typeSchemaUtils");
const convertSchema_1 = require("./convertSchema");
class ErrorAbort extends Error {
}
exports.ErrorAbort = ErrorAbort;
class SchemaGenContext {
    constructor(project, typeChecker = project.getTypeChecker(), files = new Map(), symbols = new Set(), 
    /* map from file names to any diagnostics associated with them */
    diagnostics = new Map(), generateInUserFile) {
        this.project = project;
        this.typeChecker = typeChecker;
        this.files = files;
        this.symbols = symbols;
        this.diagnostics = diagnostics;
        this.generateInUserFile = generateInUserFile;
    }
    getFileInfo(filePath) {
        return mapGetOrCreate(this.files, filePath, () => ({
            imports: new Map(),
            namespaceImports: new Map(),
            generatedSchemas: new Map(),
            /**
             * Maps a module path to an identifier, valid within the file, to
             * refer to it. These identifiers are created as placeholders, and
             * are later updated with disambiguated module names. As such, using
             * the exact identifier values within the AST, rather than copies of
             * them, is crucial.
             */
            moduleIdentifiers: {
                userModules: new Map(),
                generatedModules: new Map(),
            },
        }));
    }
    /** Returns the filePath corresponding to the location of the incident, and adds
     * location information to the given incident if relevant.
     */
    processIncident(item, incident) {
        let filePath = "unknown";
        switch (item.variant) {
            case "node":
                const sourceFile = item.node.getSourceFile();
                filePath = sourceFile.getFilePath();
                const { line: startLine, column: startColumn } = sourceFile.getLineAndColumnAtPos(item.node.getStart());
                const { line: endLine, column: endColumn } = sourceFile.getLineAndColumnAtPos(item.node.getStart());
                incident.position || (incident.position = {
                    startLine,
                    startColumn,
                    endLine,
                    endColumn,
                });
                break;
            case "type": {
                incident.typeText || (incident.typeText = item.type.getText());
                const symbol = item.type.getAliasSymbol() || item.type.getSymbol();
                if (!symbol)
                    return { filePath: "<unknown file>" };
                const declaration = getDeclaration(symbol);
                if (!declaration)
                    return { filePath: "<unknown file>" };
                const { filePath: typeFilePath } = this.processIncident({ variant: "node", node: declaration }, incident);
                filePath = typeFilePath;
                incident.name || (incident.name = symbol.getName());
                break;
            }
            case "property": {
                incident.propertyName || (incident.propertyName = item.name);
                for (const declaration of item.symbol.getDeclarations()) {
                    if (declaration instanceof tm.PropertyDeclaration ||
                        declaration instanceof tm.PropertySignature) {
                        this.processIncident({ variant: "node", node: declaration }, incident);
                        break;
                    }
                }
                return this.processIncident({ variant: "type", type: item.enclosingType }, incident);
            }
        }
        return { filePath };
    }
    addError(item, incident, abort) {
        const { filePath } = this.processIncident(item, incident);
        const incidents = mapGetOrCreate(this.diagnostics, filePath, () => ({
            errors: [],
            warnings: [],
        }));
        incidents.errors.push(incident);
        if (abort)
            throw new ErrorAbort();
    }
    addWarning(item, incident) {
        const { filePath } = this.processIncident(item, incident);
        const incidents = mapGetOrCreate(this.diagnostics, filePath, () => ({
            errors: [],
            warnings: [],
        }));
        incidents.warnings.push(incident);
    }
}
exports.SchemaGenContext = SchemaGenContext;
class ConvertTypeContext extends SchemaGenContext {
    constructor(ctx, node) {
        super(ctx.project, ctx.typeChecker, ctx.files, ctx.symbols, ctx.diagnostics);
        this.node = node;
        this.isRoot = true;
        this.currentFilePath = this.node.getSourceFile().getFilePath();
    }
    isSymbolImported(symbol) {
        const declaration = getDeclarationOrThrow(symbol);
        const symbolFileName = declaration.getSourceFile().getFilePath();
        return (this.currentFilePath !== symbolFileName ||
            isDeclarationImported(declaration));
    }
}
exports.ConvertTypeContext = ConvertTypeContext;
function isDeclarationImported(declaration) {
    return (declaration instanceof tm.ImportSpecifier ||
        declaration instanceof tm.ImportClause ||
        declaration instanceof tm.ImportDeclaration);
}
exports.isDeclarationImported = isDeclarationImported;
function buildImportTypeMap(sourceFile) {
    var _a, _b;
    const outputMap = new Map();
    for (const decl of sourceFile.getImportDeclarations()) {
        for (const specifier of decl.getNamedImports()) {
            const id = getTypeId(specifier.getType());
            const identifier = ((_a = specifier.compilerNode.name) === null || _a === void 0 ? void 0 : _a.text) ||
                ((_b = specifier.compilerNode.propertyName) === null || _b === void 0 ? void 0 : _b.text);
            outputMap.set(id, identifier);
        }
    }
    return outputMap;
}
function getModuleIdentifier(fileInfo, modulePath, importFromUserFile) {
    const moduleIdentifiers = fileInfo.moduleIdentifiers;
    return mapGetOrCreate(importFromUserFile
        ? moduleIdentifiers.userModules
        : moduleIdentifiers.generatedModules, modulePath, () => factory.createIdentifier("modulePlaceholder"));
}
function processModuleIdentifiers(fileInfo) {
    impl(fileInfo.moduleIdentifiers.generatedModules);
    impl(fileInfo.moduleIdentifiers.userModules);
    function impl(map) {
        const disambiguateGroups = (0, lodash_1.groupBy)([...map.entries()], ([path, _]) => {
            const fileName = path_1.default.parse(path).name;
            const matches = fileName.match(/[\p{L}0-9-.\s]/gu);
            if (!matches || !matches.length)
                return "__module";
            const identifierBuilder = [];
            let capitalizeNextLetter = true;
            for (const match of matches) {
                if (match === "-" || match === "." || match === " ")
                    capitalizeNextLetter = true;
                else if (identifierBuilder.length === 0 && match >= "0" && match <= "9")
                    identifierBuilder.push("_", match);
                else if (capitalizeNextLetter &&
                    match.toLowerCase() != match.toUpperCase()) {
                    capitalizeNextLetter = false;
                    identifierBuilder.push(match.toUpperCase());
                }
                else
                    identifierBuilder.push(match);
            }
            const identifier = identifierBuilder.join("");
            return fileInfo.generatedSchemas.has(identifier)
                ? `__module_${identifier}`
                : identifier;
        });
        for (const [key, group] of Object.entries(disambiguateGroups)) {
            if (group.length === 1) {
                Object.assign(group[0][1], factory.createIdentifier(key));
            }
            else {
                for (let i = 0; i < group.length; i++) {
                    Object.assign(group[i][1], factory.createIdentifier(`${key}__${i}`));
                }
            }
        }
    }
}
exports.processModuleIdentifiers = processModuleIdentifiers;
function prefixValueWithModule(ctx, name, currentFilePath, valueFilePath, importFromUserFile, escapedName) {
    const currentFileInfo = ctx.getFileInfo(currentFilePath);
    if (ctx.generateInUserFile) {
        return factory.createIdentifier(escapedName || name);
    }
    else if (!importFromUserFile && currentFilePath === valueFilePath) {
        return factory.createIdentifier(name);
    }
    else {
        return factory.createPropertyAccessExpression(getModuleIdentifier(currentFileInfo, valueFilePath, importFromUserFile), name);
    }
}
exports.prefixValueWithModule = prefixValueWithModule;
function convertSymbol(ctx, symbol, diagnosticItem, 
/** use the type for schema generation instead of attempting to resolve it */
ty) {
    let isRoot = false;
    const declaration = getDeclaration(symbol);
    if (!declaration) {
        ctx.addError(diagnosticItem, { message: `Could not find type of name \`${symbol.getName()}\`` }, true);
    }
    let currentFilePath = declaration.getSourceFile().getFilePath();
    const internalCtx = new ConvertTypeContext(ctx, declaration);
    const type = ty || declaration.getType();
    const fileName = getDeclarationDefinitionPath(declaration);
    internalCtx.currentFilePath = fileName;
    let as;
    if (ctx instanceof ConvertTypeContext) {
        isRoot = ctx.isRoot;
        currentFilePath = ctx.currentFilePath;
        if (ctx.isSymbolImported(symbol) || type.isEnum() || type.isClass()) {
            const fileInfo = ctx.getFileInfo(ctx.currentFilePath);
            const importTypeNameMap = (fileInfo.importTypeNameMap || (fileInfo.importTypeNameMap = buildImportTypeMap(ctx.node.getSourceFile())));
            const importAs = importTypeNameMap.get(getTypeId(symbol.getTypeAtLocation(ctx.node)));
            as = `${importAs || symbol.getName()}Schema`;
            fileInfo.imports.set(symbol.getName(), {
                // TODO: fix name collisions
                as,
                sourceFile: fileName,
            });
        }
    }
    if (!ctx.symbols.has(symbol)) {
        ctx.symbols.add(symbol);
        const generated = convertType(internalCtx, type, diagnosticItem);
        const generatedSchema = {
            name: symbol.getName(),
            expression: generated,
            isExported: isRoot || isDeclarationExported(declaration),
        };
        ctx
            .getFileInfo(fileName)
            .generatedSchemas.set(symbol.getName(), generatedSchema);
    }
    return lazy(prefixValueWithModule(ctx, symbol.getName(), currentFilePath, fileName, false, as));
}
exports.convertSymbol = convertSymbol;
function getDeclarationDefinitionPath(declaration) {
    if (declaration instanceof tm.ImportSpecifier) {
        return getDeclarationDefinitionPath(declaration.getImportDeclaration());
    }
    if (declaration instanceof tm.ImportClause) {
        return getDeclarationDefinitionPath(declaration.getParent());
    }
    else if (declaration instanceof tm.ImportDeclaration) {
        return declaration.getModuleSpecifierSourceFileOrThrow().getFilePath();
    }
    else
        return declaration.getSourceFile().getFilePath();
}
function baseIdentifier(entityName) {
    if (entityName instanceof tm.Identifier)
        return entityName;
    else
        return baseIdentifier(entityName.getLeft());
}
/**
 * Converts an EntityName to an expression. Optionally accepts an identifier:
 * if provided, `entityName` is converted such that its base identifier is
 * converted to a property access on the given `baseIdentifier`. This is
 * useful for implementing whole module imports.
 */
function convertEntityNameToExpression(entityName, baseIdentifier) {
    if (entityName instanceof tm.Identifier) {
        if (baseIdentifier) {
            return factory.createPropertyAccessExpression(baseIdentifier, entityName.getText());
        }
        return entityName.compilerNode;
    }
    else
        return factory.createPropertyAccessExpression(convertEntityNameToExpression(entityName.getLeft(), baseIdentifier), entityName.getRight().compilerNode);
}
function convertType(ctx, ty, diagnosticItem, 
/**
 * If true, forces generation for the current type instead of using `z.lazy()`.
 */
generateInline) {
    const typeSymbol = ty.getSymbol();
    const declaration = typeSymbol ? getDeclaration(typeSymbol) : undefined;
    const superclassTypeName = getSuperclassName(ty);
    let packageTypeName = undefined;
    if (typeSymbol) {
        packageTypeName = typeSymbol.getName();
    }
    if (!ctx.isRoot &&
        !generateInline &&
        !isNativeSymbol(typeSymbol) &&
        !isStainlessSymbol(typeSymbol)) {
        const symbol = ty.getAliasSymbol() ||
            ((ty.isClass() || ty.isInterface()) && !isNativeSymbol(typeSymbol)
                ? typeSymbol
                : null);
        if (symbol) {
            const declaration = getDeclaration(symbol);
            if (!(declaration instanceof tm.TypeAliasDeclaration ||
                declaration instanceof tm.InterfaceDeclaration) ||
                !declaration.getTypeParameters().length) {
                return convertSymbol(ctx, symbol, diagnosticItem);
            }
        }
    }
    ctx.isRoot = false;
    switch (superclassTypeName) {
        case "PrismaModel":
            return convertPrismaModelType(ctx, ty, typeSymbol, "prismaModel", superclassTypeName, diagnosticItem);
        case "PrismaModelLoader":
            return convertPrismaModelType(ctx, ty, typeSymbol, "prismaModelLoader", superclassTypeName, diagnosticItem);
    }
    switch (packageTypeName) {
        case "NumberSchema":
            return convertPrimitiveSchemaType(ctx, ty, "number", packageTypeName, typeSchemaUtils_1.numberSchemaProperties, diagnosticItem);
        case "StringSchema":
            return convertPrimitiveSchemaType(ctx, ty, "string", packageTypeName, typeSchemaUtils_1.stringSchemaProperties, diagnosticItem);
        case "BigIntSchema":
            return convertPrimitiveSchemaType(ctx, ty, "bigint", packageTypeName, typeSchemaUtils_1.bigIntSchemaProperties, diagnosticItem);
        case "DateSchema":
            return convertPrimitiveSchemaType(ctx, ty, "date", packageTypeName, typeSchemaUtils_1.dateSchemaProperties, diagnosticItem);
        case "ObjectSchema": {
            const [objectType, typeArgs] = extractGenericSchemaTypeArguments(ctx, ty);
            return convertSchemaType(ctx, packageTypeName, typeSchemaUtils_1.objectSchemaProperties, typeArgs, convertType(ctx, objectType, diagnosticItem, true), diagnosticItem);
        }
        case "ArraySchema": {
            const [elementType, typeArgs] = extractGenericSchemaTypeArguments(ctx, ty);
            const arrayConstructor = zodConstructor("array", [
                convertType(ctx, elementType, diagnosticItem),
            ]);
            return convertSchemaType(ctx, packageTypeName, typeSchemaUtils_1.arraySetSchemaProperties, typeArgs, arrayConstructor, diagnosticItem);
        }
        case "SetSchema": {
            const [elementType, typeArgs] = extractGenericSchemaTypeArguments(ctx, ty);
            const setConstructor = zodConstructor("set", [
                convertType(ctx, elementType, diagnosticItem),
            ]);
            return convertSchemaType(ctx, packageTypeName, typeSchemaUtils_1.arraySetSchemaProperties, typeArgs, setConstructor, diagnosticItem);
        }
        case "ZodSchema": {
            const typeArguments = ty.getTypeArguments();
            if (typeArguments.length != 1) {
                ctx.addError(diagnosticItem, { message: "ZodSchema takes one type argument." }, true);
            }
            const schemaContainer = typeArguments[0];
            const schemaProperty = schemaContainer.getProperty("schema");
            if (!schemaProperty) {
                ctx.addError(diagnosticItem, {
                    message: "ZodSchema takes in {schema: typeof schemaValue} as a type argument",
                }, true);
            }
            const property = getPropertyDeclaration(schemaProperty);
            if (!property)
                throw new Error("internal error: could not get declaration for `schema` property");
            const typeNode = property.getTypeNode();
            if (!(typeNode instanceof tm.TypeQueryNode)) {
                ctx.addError(typeNode ? { variant: "node", node: typeNode } : diagnosticItem, {
                    message: "the `schema` property must have type `typeof schemaValue`.",
                }, true);
            }
            const schemaEntityName = typeNode.getExprName();
            const base = baseIdentifier(schemaEntityName);
            const importPath = getDeclarationDefinitionPath(property);
            const currentFile = ctx.getFileInfo(ctx.currentFilePath);
            currentFile.imports.set(base.getText(), {
                sourceFile: importPath,
                importFromUserFile: true,
                excludeFromUserFile: true,
            });
            const baseSchema = convertEntityNameToExpression(schemaEntityName, ctx.generateInUserFile
                ? undefined
                : getModuleIdentifier(currentFile, importPath, true));
            return lazy(baseSchema);
        }
    }
    if (isStainlessSymbol(typeSymbol)) {
        switch (typeSymbol === null || typeSymbol === void 0 ? void 0 : typeSymbol.getName()) {
            case "Includable":
                return convertSimpleSchemaClassSuffix(ctx, ty, "includable", diagnosticItem);
            case "Selectable":
                return convertSimpleSchemaClassSuffix(ctx, ty, "selectable", diagnosticItem);
            case "Selection":
                return convertSimpleSchemaClassSuffix(ctx, ty, "selection", diagnosticItem);
            case "Includes":
                return convertIncludesSelects(ctx, ty, "includes", diagnosticItem);
            case "Selects":
                return convertIncludesSelects(ctx, ty, "selects", diagnosticItem);
            case "PageResponse":
                return convertSimpleSchemaClassZ(ctx, ty, "pageResponse", diagnosticItem);
        }
    }
    switch (superclassTypeName) {
        case "Schema":
            return (0, convertSchema_1.convertSchema)(ctx, ty, typeSymbol, diagnosticItem);
        case "Transform":
            return convertTransformRefineType(ctx, ty, typeSymbol, "transform", diagnosticItem);
        case "Refine":
            return convertTransformRefineType(ctx, ty, typeSymbol, "refine", diagnosticItem);
        case "SuperRefine":
            return convertTransformRefineType(ctx, ty, typeSymbol, "superRefine", diagnosticItem);
    }
    if (superclassTypeName === "ZodType" && isZodSymbol(typeSymbol)) {
        ctx.addError(diagnosticItem, {
            message: "Zod schema types are not valid input types, except as `typeof schemaValue` " +
                "within a top-level type argument or object property",
        }, true);
    }
    const origin = getTypeOrigin(ty);
    if (origin)
        return convertType(ctx, origin, diagnosticItem);
    if (ty.isBoolean()) {
        return zodConstructor("boolean");
    }
    if (ty.isClass()) {
        if (!typeSymbol) {
            ctx.addError(diagnosticItem, { message: `Could not find class ${ty.getText()}` }, true);
        }
        const declaration = getDeclarationOrThrow(typeSymbol);
        if (!isDeclarationExported(declaration)) {
            ctx.addError({ variant: "type", type: ty }, {
                message: "Classes used in Zod schemas must be exported from their modules.",
            });
        }
        const escapedName = `${typeSymbol.getName()}Schema`;
        const sourceFile = declaration.getSourceFile().getFilePath();
        ctx.getFileInfo(ctx.currentFilePath).imports.set(typeSymbol.getName(), {
            importFromUserFile: true,
            as: escapedName,
            sourceFile,
        });
        return zodConstructor("instanceof", [
            prefixValueWithModule(ctx, typeSymbol.getName(), ctx.currentFilePath, sourceFile, true, escapedName),
        ]);
    }
    if (ty.isEnum()) {
        if (!typeSymbol) {
            ctx.addError(diagnosticItem, { message: `Could not find enum ${ty.getText()}` }, true);
        }
        const declaration = getDeclarationOrThrow(typeSymbol);
        if (!isDeclarationExported(declaration)) {
            ctx.addError({ variant: "type", type: ty }, {
                message: "Enums used in Zod schemas must be exported from their modules.",
            });
        }
        const escapedName = `${typeSymbol.getEscapedName()}Schema`;
        const sourceFile = declaration.getSourceFile().getFilePath();
        ctx.getFileInfo(ctx.currentFilePath).imports.set(typeSymbol.getName(), {
            importFromUserFile: true,
            as: escapedName,
            sourceFile,
        });
        return zodConstructor("nativeEnum", [
            prefixValueWithModule(ctx, typeSymbol.getName(), ctx.currentFilePath, sourceFile, true, escapedName),
        ]);
    }
    if (ty.isUnion()) {
        let unionTypes = ty.getUnionTypes();
        return convertUnionTypes(ctx, unionTypes, diagnosticItem);
    }
    if (ty.isIntersection()) {
        const [first, ...rest] = ty.getIntersectionTypes();
        // TODO this was inlining object type aliases, we want to .merge them
        // instead, but we can't do that unless we detect when we can avoid
        // using `.lazy` for type alias references.
        // if (
        //   ty
        //     .getIntersectionTypes()
        //     .every((t) => t.isObject() && !t.isArray() && !isRecord(ctx, t))
        // ) {
        //   return rest.reduce(
        //     (schema, shapeType) =>
        //       methodCall(schema, "extend", [createZodShape(ctx, shapeType)]),
        //     convertType(ctx, first)
        //   );
        // }
        return rest.reduce((prev, next) => methodCall(prev, "and", [convertType(ctx, next, diagnosticItem)]), convertType(ctx, first, diagnosticItem));
    }
    if (ty.isArray()) {
        const elemType = ty.getArrayElementTypeOrThrow();
        return zodConstructor("array", [
            convertType(ctx, elemType, diagnosticItem),
        ]);
    }
    if (ty.isTuple()) {
        let tupleTypes = ty.getTupleElements();
        // check for tuple rest element
        // @ts-expect-error compilerType.target is untyped
        const restIndex = ty.compilerType.target.elementFlags.findIndex((flag) => flag === ts_morph_1.ts.ElementFlags.Rest);
        let restType;
        if (restIndex >= 0) {
            if (restIndex != tupleTypes.length - 1) {
                ctx.addError(diagnosticItem, {
                    message: "Zod only supports rest elements at the end of tuples.",
                });
                return zodConstructor("any");
            }
            restType = tupleTypes.at(-1);
            // don't include rest type in tuple args
            tupleTypes = tupleTypes.slice(0, -1);
        }
        let schema = zodConstructor("tuple", [
            factory.createArrayLiteralExpression(tupleTypes.map((ty) => convertType(ctx, ty, diagnosticItem))),
        ]);
        if (restIndex >= 0) {
            schema = methodCall(schema, "rest", [
                convertType(ctx, restType, diagnosticItem),
            ]);
        }
        return schema;
    }
    if (ty.isObject()) {
        const callSignatures = ty.getCallSignatures();
        if (callSignatures.length !== 0) {
            if (callSignatures.some((signature) => signature.getTypeParameters().length > 0)) {
                // TODO: should this be a warning or error?
                return zodConstructor("any");
            }
            const [first, ...rest] = callSignatures;
            return rest.reduce((prev, curr) => methodCall(prev, "and", [
                convertCallSignature(ctx, curr, diagnosticItem),
            ]), convertCallSignature(ctx, first, diagnosticItem));
        }
        if (isNativeSymbol(typeSymbol)) {
            // TODO: for these items, the previous diagnostic item is likely more useful. Use
            // that instead.
            switch (typeSymbol === null || typeSymbol === void 0 ? void 0 : typeSymbol.getName()) {
                case "Date":
                    return zodConstructor("date");
                case "Set": {
                    const args = ty.getTypeArguments();
                    if (args.length !== 1)
                        throw new Error(`expected one Set<> type argument`);
                    return zodConstructor("set", [
                        convertType(ctx, args[0], diagnosticItem),
                    ]);
                }
                case "Map": {
                    const args = ty.getTypeArguments();
                    if (args.length !== 2)
                        throw new Error(`expected two Map<> type arguments`);
                    return zodConstructor("map", args.map((arg) => convertType(ctx, arg, diagnosticItem)));
                }
                case "Promise": {
                    const args = ty.getTypeArguments();
                    if (args.length !== 1)
                        throw new Error(`expected one Promise<> type argument`);
                    return zodConstructor("promise", [
                        convertType(ctx, args[0], diagnosticItem),
                    ]);
                }
            }
        }
        // if the object is an indexed access type
        const indexInfos = ctx.typeChecker.compilerObject.getIndexInfosOfType(ty.compilerType);
        if (indexInfos.length) {
            const valueGroups = Object.values((0, lodash_1.groupBy)(indexInfos, (info) => 
            // @ts-expect-error why would they not expose id property...
            info.type.id));
            const recordTypes = valueGroups.map((indexInfos) => {
                const keyTypes = indexInfos.map((indexInfo) => getTypeWrapper(ty, indexInfo.keyType));
                const keyType = convertUnionTypes(ctx, keyTypes, diagnosticItem);
                // TODO: should we set this to property where possible?
                const valueType = convertType(ctx, getTypeWrapper(ty, indexInfos[0].type), diagnosticItem);
                return zodConstructor("record", [keyType, valueType]);
            });
            return recordTypes.length === 1
                ? recordTypes[0]
                : zodConstructor("union", [
                    factory.createArrayLiteralExpression(recordTypes),
                ]);
        }
        return zodConstructor("object", [createZodShape(ctx, ty)]);
    }
    if (ty.compilerType.flags & ts_morph_1.ts.TypeFlags.ESSymbol) {
        return zodConstructor("symbol");
    }
    if (ty.isNumber()) {
        return zodConstructor("number");
    }
    if (ty.isBooleanLiteral()) {
        return zodConstructor("literal", [
            isTrueLiteral(ty) ? factory.createTrue() : factory.createFalse(),
        ]);
    }
    if (ty.compilerType.flags === ts_morph_1.ts.TypeFlags.BigIntLiteral) {
        const value = ty.getLiteralValue();
        return zodConstructor("literal", [factory.createBigIntLiteral(value)]);
    }
    if (ty.isStringLiteral()) {
        return zodConstructor("literal", [
            factory.createStringLiteral(ty.getLiteralValue()),
        ]);
    }
    if (ty.isNumberLiteral()) {
        return zodConstructor("literal", [
            factory.createNumericLiteral(ty.getLiteralValue()),
        ]);
    }
    if (ty.isString()) {
        return zodConstructor("string");
    }
    if (ty.compilerType.flags & ts_morph_1.ts.TypeFlags.BigInt) {
        return zodConstructor("bigint");
    }
    if (ty.isUndefined()) {
        return zodConstructor("undefined");
    }
    if (ty.isNull()) {
        return zodConstructor("null");
    }
    if (ty.compilerType.flags & ts_morph_1.ts.TypeFlags.Void) {
        return zodConstructor("void");
    }
    if (ty.isAny()) {
        return zodConstructor("any");
    }
    if (ty.isUnknown()) {
        return zodConstructor("unknown");
    }
    if (ty.isNever()) {
        return zodConstructor("never");
    }
    ctx.addError(diagnosticItem, { message: `unsupported type: ${ty.getText()}` }, true);
}
exports.convertType = convertType;
function zodConstructor(ty, args = []) {
    return factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("z"), factory.createIdentifier(ty)), undefined, args);
}
function methodCall(target, name, args = []) {
    return factory.createCallExpression(factory.createPropertyAccessExpression(target, factory.createIdentifier(name)), undefined, args);
}
exports.methodCall = methodCall;
function thunk(expression) {
    return factory.createArrowFunction(undefined, undefined, [], undefined, undefined, expression);
}
function lazy(expression) {
    return zodConstructor("lazy", [thunk(expression)]);
}
function getTypeOrigin(type) {
    if (type instanceof tm.Type) {
        const origin = getTypeOrigin(type.compilerType);
        return origin ? getTypeWrapper(type, origin) : undefined;
    }
    //@ts-expect-error
    return type.origin;
}
function getTypeWrapper(ctxProvider, type) {
    // @ts-expect-error
    return ctxProvider._context.compilerFactory.getType(type);
}
function isSymbolInFile(symbol, filePattern) {
    if (!symbol)
        return false;
    const declaration = getDeclaration(symbol);
    const sourceFile = declaration === null || declaration === void 0 ? void 0 : declaration.getSourceFile().getFilePath();
    if (!sourceFile)
        return false;
    return sourceFile.match(filePattern) != null;
}
function isNativeSymbol(symbol) {
    return isSymbolInFile(symbol, /typescript\/lib\/.*\.d\.ts$/);
}
function isStainlessSymbol(symbol) {
    return isSymbolInFile(symbol, /stainless\/dist\/.*\.d\.ts$/);
}
function isZodSymbol(symbol) {
    return (isSymbolInFile(symbol, /zod\/lib\/.*\.d\.ts$/) || isStainlessSymbol(symbol));
}
function isTsToZodSymbol(symbol) {
    return isStainlessSymbol(symbol);
}
function isStainlessPrismaSymbol(symbol) {
    return isSymbolInFile(symbol, /prisma\/dist\/.*\.d\.ts$/);
}
function createZodShape(ctx, type) {
    return factory.createObjectLiteralExpression(type.getProperties().map((property) => {
        const propertyType = ctx.typeChecker.getTypeOfSymbolAtLocation(property, ctx.node);
        // If the current property has a parent type associated with it, use that
        // parent type for diagnostics information ini order to correctly attribute
        // the source of problematic types.
        let enclosingType = type;
        const propertyDeclaration = getPropertyDeclaration(property);
        if (propertyDeclaration) {
            const parentNode = propertyDeclaration.getParent();
            if (parentNode) {
                const parentType = ctx.typeChecker.getTypeAtLocation(parentNode);
                if (parentType)
                    enclosingType = parentType;
            }
        }
        const propertySchema = convertType(ctx, propertyType, {
            variant: "property",
            name: property.getName(),
            symbol: property,
            enclosingType,
        });
        return factory.createPropertyAssignment(property.getName(), propertySchema);
    }));
}
function isTrueLiteral(type) {
    return (type.isBooleanLiteral() &&
        // @ts-expect-error untyped api
        type.compilerType.intrinsicName === "true");
}
function isFalseLiteral(type) {
    return (type.isBooleanLiteral() &&
        // @ts-expect-error untyped api
        type.compilerType.intrinsicName === "false");
}
function convertCallSignature(ctx, callSignature, diagnosticItem) {
    const argumentTypes = callSignature.getParameters().map((param) => {
        const paramType = param.getTypeAtLocation(ctx.node);
        return convertType(ctx, paramType, diagnosticItem);
    });
    const returnType = convertType(ctx, callSignature.getReturnType(), diagnosticItem);
    return zodConstructor("function", [
        zodConstructor("tuple", [
            factory.createArrayLiteralExpression(argumentTypes),
        ]),
        returnType,
    ]);
}
function convertUnionTypes(ctx, unionTypes, diagnosticItem) {
    const isOptional = unionTypes.some((unionType) => unionType.isUndefined());
    const isNullable = unionTypes.some((unionType) => unionType.isNull());
    if (isOptional || isNullable) {
        unionTypes = unionTypes.filter((unionType) => !unionType.isUndefined() && !unionType.isNull());
    }
    // see if the union is made up of objects that each have at least
    // one property that holds a literal in common
    // if so, generate a z.discriminatedUnion instead of a union
    //
    if (unionTypes.length >= 2) {
        const [first, ...rest] = unionTypes;
        const discriminator = first.getProperties().find((property) => {
            const type = property.getTypeAtLocation(ctx.node);
            if (!isLiteralish(type) ||
                !rest.every((restType) => {
                    var _a;
                    const type = (_a = restType
                        .getProperty(property.getName())) === null || _a === void 0 ? void 0 : _a.getTypeAtLocation(ctx.node);
                    return type && isLiteralish(type);
                })) {
                return false;
            }
            const literalValues = unionTypes.flatMap((unionType) => getLiteralValues(unionType
                .getPropertyOrThrow(property.getName())
                .getTypeAtLocation(ctx.node)));
            return new Set(literalValues).size === literalValues.length;
        });
        if (discriminator) {
            return zodConstructor("discriminatedUnion", [
                factory.createStringLiteral(discriminator.getName()),
                factory.createArrayLiteralExpression(unionTypes.map((unionType) => convertType(ctx, unionType, diagnosticItem))),
            ]);
        }
    }
    let schema = (() => {
        if (unionTypes.length === 1)
            return convertType(ctx, unionTypes[0], diagnosticItem);
        if (unionTypes.every((unionType) => unionType.isStringLiteral())) {
            return zodConstructor("enum", [
                factory.createArrayLiteralExpression(unionTypes.map((unionType) => factory.createStringLiteral(unionType.getLiteralValueOrThrow()))),
            ]);
        }
        // Internally booleans seem to be represented as unions of true or false
        // in some cases, which results in slightly worse codegen, so we simplify
        // in case that both true and false are found
        const hasSyntheticBoolean = unionTypes.some(isTrueLiteral) && unionTypes.some(isFalseLiteral);
        const nonSynthBooleanTypes = hasSyntheticBoolean
            ? unionTypes.filter((t) => !t.isBooleanLiteral() && !t.isBoolean())
            : unionTypes;
        if (!nonSynthBooleanTypes.length)
            return zodConstructor("boolean");
        return zodConstructor("union", [
            factory.createArrayLiteralExpression([
                ...nonSynthBooleanTypes.map((t) => convertType(ctx, t, diagnosticItem)),
                ...(hasSyntheticBoolean ? [zodConstructor("boolean")] : []),
            ], false),
        ]);
    })();
    if (isNullable)
        schema = methodCall(schema, "nullable");
    if (isOptional)
        schema = methodCall(schema, "optional");
    return schema;
}
function convertTransformRefineType(ctx, ty, symbol, variant, diagnosticItem) {
    var _a;
    if (!symbol) {
        ctx.addError(diagnosticItem, { message: `failed to get symbol for ${variant}: ${ty.getText()}` }, true);
    }
    const declaration = getDeclaration(symbol);
    if (!declaration ||
        !(isDeclarationImported(declaration) || isDeclarationExported(declaration))) {
        ctx.addError(diagnosticItem, {
            message: `Subclass ${symbol.getName()} must be exported from its declaring module.`,
        });
    }
    const inputType = (_a = ty.getProperty("input")) === null || _a === void 0 ? void 0 : _a.getTypeAtLocation(ctx.node);
    if (!inputType)
        throw new Error("Expected refine to have input property");
    const typeFilePath = getTypeFilePath(ty);
    const currentFileInfo = ctx.getFileInfo(ctx.currentFilePath);
    // import the class
    currentFileInfo.imports.set(symbol.getName(), {
        importFromUserFile: true,
        sourceFile: typeFilePath,
    });
    const classExpression = prefixValueWithModule(ctx, symbol.getName(), ctx.currentFilePath, typeFilePath, true);
    const callArgs = [
        factory.createPropertyAccessExpression(factory.createNewExpression(classExpression, undefined, []), factory.createIdentifier(variant)),
    ];
    if (variant === "refine" && ty.getProperty("message")) {
        callArgs.push(factory.createPropertyAccessExpression(factory.createNewExpression(classExpression, undefined, []), factory.createIdentifier("message")));
    }
    return methodCall(convertType(ctx, inputType, diagnosticItem), variant, callArgs);
}
function convertPrismaModelType(ctx, type, symbol, method, baseTypeName, diagnosticItem) {
    const declaration = getDeclaration(symbol);
    if (!declaration ||
        !(isDeclarationImported(declaration) || isDeclarationExported(declaration))) {
        ctx.addError(diagnosticItem, {
            message: `Subclass ${symbol.getName()} must be exported from its declaring module.`,
        });
    }
    const inputProperty = type.getProperty("input");
    const inputType = inputProperty === null || inputProperty === void 0 ? void 0 : inputProperty.getTypeAtLocation(ctx.node);
    if (!inputType) {
        ctx.addError(diagnosticItem, {
            message: `A class extending \`${baseTypeName}\` must have a property called \`input\` specifying the schema with which the prisma model will be associated.`,
        }, true);
    }
    const inputSchema = convertType(ctx, inputType, diagnosticItem);
    const typeFilePath = getTypeFilePath(type);
    // import the class
    ctx.getFileInfo(ctx.currentFilePath).imports.set(symbol.getName(), {
        importFromUserFile: true,
        sourceFile: typeFilePath,
        excludeFromUserFile: true,
    });
    return methodCall(inputSchema, method, [
        thunk(factory.createPropertyAccessExpression(factory.createNewExpression(prefixValueWithModule(ctx, symbol.getName(), ctx.currentFilePath, typeFilePath, true), undefined, undefined), "model")),
    ]);
}
const SCHEMA_TUPLE_TYPE_ERROR = `schema property of type tuple must be of form [<literal value>, "string literal message"]`;
function convertPrimitiveSchemaType(ctx, type, zodConstructorName, schemaTypeName, allowedParameters, diagnosticItem) {
    const args = type.getTypeArguments();
    if (args.length === 0 || !args[0].isObject()) {
        ctx.addError(diagnosticItem, {
            message: "ts-to-zod schema types take object literals as validation properties",
        }, true);
    }
    const [typeArgs] = args;
    return convertSchemaType(ctx, schemaTypeName, allowedParameters, typeArgs, zodConstructor(zodConstructorName), diagnosticItem);
}
function extractGenericSchemaTypeArguments(ctx, type) {
    const args = type.getTypeArguments();
    if (args.length != 2 || !args[1].isObject()) {
        throw new Error("ts-to-zod Object, Array, and Set schema types take two type arguments");
    }
    return args;
}
function convertIncludesSelects(ctx, type, name, diagnosticItem) {
    const args = type.getTypeArguments();
    if (args.length < 1 || args.length > 2) {
        throw new Error("stainless takes one or two type parameters");
    }
    if (args[1] && !args[1].isNumberLiteral()) {
        ctx.addError(diagnosticItem, {
            message: "expected a single numeric literal between 0 and 5",
        });
    }
    const schemaExpression = convertType(ctx, args[0], diagnosticItem);
    const depth = args[1].getLiteralValue() || 3;
    return zodConstructor(name, [
        schemaExpression,
        factory.createNumericLiteral(depth),
    ]);
}
function convertSimpleSchemaClassZ(ctx, type, name, diagnosticItem) {
    const args = type.getTypeArguments();
    if (args.length !== 1) {
        throw new Error(`${name} takes one type parameter`);
    }
    const schemaExpression = convertType(ctx, args[0], diagnosticItem);
    return zodConstructor(name, [schemaExpression]);
}
function convertSimpleSchemaClassSuffix(ctx, type, name, diagnosticItem) {
    const args = type.getTypeArguments();
    if (args.length != 1) {
        throw new Error(`expected one type argument for ${name}`);
    }
    const arg = args[0];
    const schemaExpression = convertType(ctx, arg, diagnosticItem);
    return methodCall(schemaExpression, name);
}
function convertSchemaType(ctx, schemaTypeName, allowedParameters, typeArgs, baseExpression, diagnosticItem) {
    let expression = baseExpression;
    // Special-cases how to handle string value literals.
    // This is needed for the case of `min` and `max` for
    // `DateSchema`, and `regex` for `StringSchema`, as they take
    // in instances of `Date` and `RegExp`, but
    // users can only pass string literals as type arguments.
    // This function converts those literals to Dates at
    // runtime.
    const createValueStringLiteral = (s, property) => {
        const stringLiteral = factory.createStringLiteral(s);
        return schemaTypeName === "DateSchema"
            ? factory.createNewExpression(factory.createIdentifier("Date"), [], [stringLiteral])
            : schemaTypeName === "StringSchema" && property === "regex"
                ? factory.createNewExpression(factory.createIdentifier("RegExp"), [], [factory.createStringLiteral(s)])
                : stringLiteral;
    };
    const typeArgsSymbol = typeArgs.getAliasSymbol() || typeArgs.getSymbol();
    if (typeArgsSymbol) {
        const declaration = getDeclaration(typeArgsSymbol);
        if (declaration) {
            diagnosticItem = { variant: "type", type: typeArgs };
        }
    }
    for (const property of typeArgs.getProperties()) {
        diagnosticItem = {
            variant: "property",
            name: property.getName(),
            symbol: property,
            enclosingType: typeArgs,
        };
        const name = property.getName();
        if (!allowedParameters.has(name)) {
            // TODO: customize how this is handled
            ctx.addError(diagnosticItem, {
                message: `${schemaTypeName} does not accept ${name} as a parameter.`,
            });
            continue;
        }
        // default is generated after `z.schemaTypeName`
        if (name === "default")
            continue;
        // ip and datetime are special in that they can take an object as a
        // parameter. This requires special logic in a few cases.
        const ipDatetimeSpecialCase = name === "ip" || name === "datetime";
        const ty = ctx.typeChecker.getTypeOfSymbolAtLocation(property, ctx.node);
        if (ipDatetimeSpecialCase &&
            ty.isObject() &&
            !ty.isArray() &&
            !ty.isTuple()) {
            let versionSymbol = ty.getProperty("version");
            let precisionSymbol = ty.getProperty("precision");
            let offsetSymbol = ty.getProperty("offset");
            let messageSymbol = ty.getProperty("message");
            let properties = [];
            if (versionSymbol) {
                properties.push(factory.createPropertyAssignment("version", factory.createStringLiteral(versionSymbol
                    .getTypeAtLocation(ctx.node)
                    .getLiteralValue())));
            }
            if (precisionSymbol) {
                properties.push(factory.createPropertyAssignment("precison", factory.createNumericLiteral(precisionSymbol
                    .getTypeAtLocation(ctx.node)
                    .getLiteralValue())));
            }
            if (offsetSymbol) {
                properties.push(factory.createPropertyAssignment("offset", factory.createTrue()));
            }
            if (messageSymbol) {
                properties.push(factory.createPropertyAssignment("message", factory.createStringLiteral(messageSymbol
                    .getTypeAtLocation(ctx.node)
                    .getLiteralValue())));
            }
            expression = methodCall(expression, name, [
                factory.createObjectLiteralExpression(properties),
            ]);
            continue;
        }
        if (name === "catchall") {
            expression = methodCall(expression, "catchall", [
                convertType(ctx, ty, diagnosticItem),
            ]);
            continue;
        }
        let literalValue;
        literalValue =
            ty.getLiteralValue() || ty.getFlags() === ts_morph_1.ts.TypeFlags.BooleanLiteral;
        let literalMessage;
        if (literalValue) {
        }
        else if (ty.isTuple()) {
            const tupleTypes = ty.getTupleElements();
            if (tupleTypes.length != 2) {
                ctx.addError(diagnosticItem, {
                    message: SCHEMA_TUPLE_TYPE_ERROR,
                });
                continue;
            }
            else if (ipDatetimeSpecialCase) {
                ctx.addError(diagnosticItem, {
                    message: `The StringSchema ${name} property does not accept a tuple with error string information.`,
                });
                continue;
            }
            const [literalType, messageType] = tupleTypes;
            const value = literalType.getLiteralValue() ||
                literalType.getFlags() === ts_morph_1.ts.TypeFlags.BooleanLiteral;
            if (!value || messageType.getFlags() !== ts_morph_1.ts.TypeFlags.StringLiteral) {
                ctx.addError(diagnosticItem, {
                    message: SCHEMA_TUPLE_TYPE_ERROR,
                });
                continue;
            }
            literalValue = value;
            literalMessage = messageType.getLiteralValue();
        }
        else {
            ctx.addError(diagnosticItem, {
                message: `Invalid parameter value passed for ${name}`,
            });
            continue;
        }
        if (literalValue) {
            let args;
            if (typeof literalValue === "string")
                args = [createValueStringLiteral(literalValue, name)];
            else if (typeof literalValue === "number")
                args = [factory.createNumericLiteral(literalValue)];
            else if (typeof literalValue === "bigint")
                args = [factory.createBigIntLiteral(literalValue)];
            else
                args = [];
            if (literalMessage)
                args.push(factory.createStringLiteral(literalMessage));
            expression = methodCall(expression, name, args);
        }
    }
    const defaultProperty = typeArgs.getProperty("default");
    if (defaultProperty) {
        const defaultLiteral = defaultProperty
            .getTypeAtLocation(ctx.node)
            .getLiteralValue();
        if (!defaultLiteral) {
            ctx.addError(diagnosticItem, {
                message: "`default` must be provided a literal value.",
            });
        }
        else {
            expression = methodCall(expression, "default", [
                convertLiteralValueToExpression(defaultLiteral),
            ]);
        }
    }
    return expression;
}
function mapGetOrCreate(map, key, init) {
    let value = map.get(key);
    if (!value) {
        value = init();
        map.set(key, value);
    }
    return value;
}
function isDeclarationExported(declaration) {
    var _a;
    // @ts-expect-error localSymbol untyped
    return ((_a = declaration.compilerNode.localSymbol) === null || _a === void 0 ? void 0 : _a.exportSymbol) != null;
}
exports.isDeclarationExported = isDeclarationExported;
function getTypeId(type) {
    // @ts-expect-error id is untyped
    return type.compilerType.id;
}
function getSuperclassName(type) {
    const symbol = type.getSymbol();
    if (!symbol)
        return undefined;
    const declaration = getDeclaration(symbol);
    if (!declaration)
        return;
    if (!tm.Node.isClassDeclaration(declaration) &&
        !tm.Node.isClassExpression(declaration))
        return undefined;
    const heritageClause = declaration.getHeritageClauseByKind(ts_morph_1.ts.SyntaxKind.ExtendsKeyword);
    const extendsTypeNode = heritageClause === null || heritageClause === void 0 ? void 0 : heritageClause.getTypeNodes()[0];
    const superclassSymbol = extendsTypeNode === null || extendsTypeNode === void 0 ? void 0 : extendsTypeNode.getType().getSymbol();
    return superclassSymbol === null || superclassSymbol === void 0 ? void 0 : superclassSymbol.getName();
}
/** Is a type either a literal or union of literalish types */
function isLiteralish(ty) {
    if (ty.isLiteral())
        return true;
    else if (ty.isUnion()) {
        const unionTypes = ty.getUnionTypes();
        return unionTypes.every((unionType) => isLiteralish(unionType));
    }
    else
        return false;
}
function getLiteralValues(type) {
    if (type.isLiteral())
        return [type.getLiteralValue()];
    else if (type.isUnion())
        return type
            .getUnionTypes()
            .flatMap((unionType) => getLiteralValues(unionType));
    else
        return [];
}
function getTypeFilePath(type) {
    var _a, _b;
    return (_b = (_a = getTypeDeclaration(type)) === null || _a === void 0 ? void 0 : _a.getSourceFile()) === null || _b === void 0 ? void 0 : _b.getFilePath();
}
exports.getTypeFilePath = getTypeFilePath;
function getTypeDeclaration(type) {
    const symbol = type.getAliasSymbol() || type.getSymbol();
    if (!symbol)
        return;
    return getDeclaration(symbol);
}
function getDeclaration(symbol) {
    let importDeclaration;
    const declarations = symbol.getDeclarations();
    for (const declaration of declarations) {
        if (declaration instanceof tm.ImportSpecifier && !importDeclaration) {
            importDeclaration = declaration;
        }
        if (declaration instanceof tm.TypeAliasDeclaration ||
            declaration instanceof tm.InterfaceDeclaration ||
            declaration instanceof tm.ClassDeclaration ||
            declaration instanceof tm.ClassExpression ||
            declaration instanceof tm.TypeLiteralNode ||
            declaration instanceof tm.EnumDeclaration) {
            return declaration;
        }
    }
    if (importDeclaration) {
        const symbol = importDeclaration.getSymbol();
        if (symbol && !symbol.getValueDeclaration()) {
            return importDeclaration;
        }
    }
    return undefined;
}
exports.getDeclaration = getDeclaration;
function getDeclarationOrThrow(symbol) {
    const declaration = getDeclaration(symbol);
    if (!declaration) {
        throw new Error("could not get type declaration for that symbol");
    }
    else
        return declaration;
}
// TODO: move to utils file
function getPropertyDeclaration(symbol) {
    for (const declaration of symbol.getDeclarations()) {
        if (declaration instanceof tm.PropertyDeclaration ||
            declaration instanceof tm.PropertySignature) {
            return declaration;
        }
    }
}
exports.getPropertyDeclaration = getPropertyDeclaration;
function convertLiteralValueToExpression(literal) {
    switch (typeof literal) {
        case "string":
            return factory.createStringLiteral(literal);
        case "number":
            return factory.createNumericLiteral(literal);
        case "undefined":
            return factory.createIdentifier("undefined");
        default:
            return factory.createBigIntLiteral(literal);
    }
}
//# sourceMappingURL=convertType.js.map