import * as tm from "ts-morph";
import { ts } from "ts-morph";
import {
  ConvertTypeContext,
  DiagnosticItem,
  convertType,
  getDeclaration,
  getTypeFilePath,
  isDeclarationExported,
  isDeclarationImported,
  methodCall,
  prefixValueWithModule,
} from "./convertType";
const factory = ts.factory;

export function convertSchema(
  ctx: ConvertTypeContext,
  type: tm.Type,
  symbol: tm.Symbol,
  diagnosticItem: DiagnosticItem,
): ts.Expression {
  const declaration = getDeclaration(symbol) as tm.ClassDeclaration | undefined;
  if (
    !declaration ||
    !(isDeclarationImported(declaration) || isDeclarationExported(declaration))
  ) {
    ctx.addError(
      diagnosticItem,
      {
        message: `Subclass ${symbol.getName()} must be exported from its declaring module.`,
      },
      true,
    );
  }

  const inputType = type.getProperty("input")?.getTypeAtLocation(ctx.node);
  if (!inputType) throw new Error("Expected refine to have input property");

  const typeFilePath = getTypeFilePath(type)!;

  const currentFileInfo = ctx.getFileInfo(ctx.currentFilePath);

  // import the class
  currentFileInfo.imports.set(symbol.getName(), {
    importFromUserFile: true,
    sourceFile: typeFilePath,
  });

  const classExpression = prefixValueWithModule(
    ctx,
    symbol.getName(),
    ctx.currentFilePath,
    typeFilePath,
    true,
  );
  const newClassExpression = factory.createNewExpression(
    classExpression,
    undefined,
    [],
  );

  let schemaExpression = convertType(ctx, inputType, diagnosticItem);

  if (declaration.getMethod("validate")) {
    schemaExpression = methodCall(schemaExpression, "refine", [
      factory.createPropertyAccessExpression(
        newClassExpression,
        factory.createIdentifier("validate"),
      ),
    ]);
  }
  if (declaration.getMethod("transform")) {
    schemaExpression = methodCall(schemaExpression, "stlTransform", [
      factory.createPropertyAccessExpression(
        newClassExpression,
        factory.createIdentifier("transform"),
      ),
    ]);
  }

  if (declaration.getProperty("default")) {
    schemaExpression = methodCall(schemaExpression, "default", [
      factory.createPropertyAccessExpression(
        newClassExpression,
        factory.createIdentifier("default"),
      ),
    ]);
  }

  return schemaExpression;
}
