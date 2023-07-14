import * as tm from "ts-morph";
import { SchemaGenContext, convertSymbol } from "../convertType";
import { testProject } from "./testProject";
import { GenOptions, generateFiles } from "../generateFiles";
import * as path from "path";
import pkgUp from "pkg-up";

export const multiFileTestCase = async (options: {
  __filename: string;
  getNode?: (file: tm.SourceFile) => tm.Node | null | undefined;
  getSymbol?: (file: tm.SourceFile) => tm.Symbol | null | undefined;
  genOptions?: GenOptions;
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
  const rootPackageJson = await pkgUp({
    cwd: __dirname,
  });
  if (!rootPackageJson) {
    throw new Error("test must run within npm package");
  }
  const rootPath = path.dirname(rootPackageJson);
  const result: Record<string, string> = {};
  const genOptions = options.genOptions || {
    genLocation: {
      type: "alongside",
      dependencyGenPath: "./dependency-schemas/",
    },
    rootPath,
  };
  for (const [file, sourceFile] of generateFiles(ctx, genOptions)) {
    const relativeFile = path.relative(rootPath, file);
    result[relativeFile] = tm.ts.createPrinter().printFile(sourceFile);
  }
  return result;
};
