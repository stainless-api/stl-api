import * as tm from "ts-morph";
import {
  SchemaGenContext,
  ConvertTypeContext,
  convertType,
} from "../convertType";
import { testProject } from "./testProject";

export const testCase =
  (options: {
    __filename: string;
    getNode?: (file: tm.SourceFile) => tm.Node | null | undefined;
    getType?: (file: tm.SourceFile) => tm.Type | null | undefined;
    expected: string;
  }) =>
  () => {
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
    const type = options.getType ? options.getType(sourceFile) : node.getType();
    if (!type) {
      throw new Error(`failed to get Type from SourceFile`);
    }
    const ctx = new ConvertTypeContext(new SchemaGenContext(testProject), node);
    const actual = convertType(ctx, type);
    expect(tm.printNode(actual)).toEqual(options.expected);
  };
