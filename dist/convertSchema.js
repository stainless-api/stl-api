"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSchema = void 0;
const ts_morph_1 = require("ts-morph");
const convertType_1 = require("./convertType");
const factory = ts_morph_1.ts.factory;
function convertSchema(ctx, type, symbol, diagnosticItem) {
    var _a;
    const declaration = (0, convertType_1.getDeclaration)(symbol);
    if (!declaration ||
        !((0, convertType_1.isDeclarationImported)(declaration) || (0, convertType_1.isDeclarationExported)(declaration))) {
        ctx.addError(diagnosticItem, {
            message: `Subclass ${symbol.getName()} must be exported from its declaring module.`,
        }, true);
    }
    const inputType = (_a = type.getProperty("input")) === null || _a === void 0 ? void 0 : _a.getTypeAtLocation(ctx.node);
    if (!inputType)
        throw new Error("Expected refine to have input property");
    const typeFilePath = (0, convertType_1.getTypeFilePath)(type);
    const currentFileInfo = ctx.getFileInfo(ctx.currentFilePath);
    // import the class
    currentFileInfo.imports.set(symbol.getName(), {
        importFromUserFile: true,
        sourceFile: typeFilePath,
    });
    const classExpression = (0, convertType_1.prefixValueWithModule)(ctx, symbol.getName(), ctx.currentFilePath, typeFilePath, true);
    const newClassExpression = factory.createNewExpression(classExpression, undefined, []);
    let schemaExpression = (0, convertType_1.convertType)(ctx, inputType, diagnosticItem);
    if (declaration.getMethod("validate")) {
        schemaExpression = (0, convertType_1.methodCall)(schemaExpression, "refine", [
            factory.createPropertyAccessExpression(newClassExpression, factory.createIdentifier("validate")),
        ]);
    }
    if (declaration.getMethod("transform")) {
        schemaExpression = (0, convertType_1.methodCall)(schemaExpression, "stlTransform", [
            factory.createPropertyAccessExpression(newClassExpression, factory.createIdentifier("transform")),
        ]);
    }
    if (declaration.getProperty("default")) {
        schemaExpression = (0, convertType_1.methodCall)(schemaExpression, "default", [
            factory.createPropertyAccessExpression(newClassExpression, factory.createIdentifier("default")),
        ]);
    }
    return schemaExpression;
}
exports.convertSchema = convertSchema;
//# sourceMappingURL=convertSchema.js.map