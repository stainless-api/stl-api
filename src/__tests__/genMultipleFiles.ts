import * as tm from "ts-morph";
import { SchemaGenContext, convertSymbol } from "../convertType";
import { generateFiles } from "../generateFiles";
import { testProject } from "./testProject";

export const genMultipleFiles = (options: {
  __filename: string;
  getNode?: (file: tm.SourceFile) => tm.Node | null | undefined;
  getSymbol?: (file: tm.SourceFile) => tm.Symbol | null | undefined;
}) => {
  const sourceFile = testProject.getSourceFile(options.__filename);
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
  const ctx = new SchemaGenContext(testProject);
  convertSymbol(ctx, symbol);
  const result: Record<string, string> = {};
  for (const [file, sourceFile] of generateFiles(ctx, {
    genLocation: {
      type: "alongside",
      dependencyGenPath: "./dependency-schemas/",
    },
    rootPath: process.cwd(),
  })) {
    result[file] = tm.ts.createPrinter().printFile(sourceFile);
  }
  return result;
};
