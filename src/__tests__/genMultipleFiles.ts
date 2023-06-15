import * as tm from "ts-morph";
import * as path from "path";
import { SchemaGenContext, convertSymbol, generateFiles } from "../convertType";

const root = path.resolve(__dirname, "..", "..");

const project = new tm.Project({
  tsConfigFilePath: path.join(root, "tsconfig.json"),
});

export const genMultipleFiles = (options: {
  __filename: string;
  getNode?: (file: tm.SourceFile) => tm.Node | null | undefined;
  getSymbol?: (file: tm.SourceFile) => tm.Symbol | null | undefined;
}) => {
  const sourceFile = project.getSourceFile(options.__filename);
  if (!sourceFile) {
    throw new Error(`failed to get SourceFile`);
  }
  const node = options.getNode
    ? options.getNode(sourceFile)
    : sourceFile.getTypeAlias("T") ||
      sourceFile.getInterface("T") ||
      sourceFile.getEnum("T");
  if (!node) {
    throw new Error(`failed to get Node from SourceFile`);
  }
  const symbol = options.getSymbol
    ? options.getSymbol(sourceFile)
    : node.getSymbol();
  if (!symbol) {
    throw new Error(`failed to get Symbol from SourceFile`);
  }
  const ctx = new SchemaGenContext(project);
  convertSymbol(ctx, symbol);
  const result: Record<string, string> = {};
  for (const [file, sourceFile] of generateFiles(ctx)) {
    result[file] = tm.ts.createPrinter().printFile(sourceFile);
  }
  return result;
};
