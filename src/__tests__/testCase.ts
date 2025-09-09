import * as tm from "ts-morph";
import {
  SchemaGenContext,
  ConvertTypeContext,
  convertType,
} from "../convertType";
import { testProject } from "./testProject";

const time = process.env.TIME != null;

export const testCase = ({
  __filename: filename,
  nodeName = "T",
  getNode = (sourceFile) =>
    sourceFile.getTypeAlias(nodeName) ||
    sourceFile.getInterface(nodeName) ||
    sourceFile.getEnum(nodeName),
  getType,
}: {
  __filename: string;
  nodeName?: string;
  getNode?: (file: tm.SourceFile) => tm.Node | null | undefined;
  getType?: (file: tm.SourceFile) => tm.Type | null | undefined;
}) => {
  if (time) console.time("getSourceFile");
  const sourceFile = testProject.getSourceFile(filename);
  if (time) console.timeEnd("getSourceFile");
  if (!sourceFile) {
    throw new Error(`failed to get SourceFile`);
  }
  if (time) console.time("getNode");
  const node = getNode(sourceFile);
  if (time) console.timeEnd("getNode");
  if (!node) {
    throw new Error(`failed to get Node from SourceFile`);
  }
  if (time) console.time("getType");
  const type = getType ? getType(sourceFile) : node.getType();
  if (time) console.timeEnd("getType");
  if (!type) {
    throw new Error(`failed to get Type from SourceFile`);
  }
  if (time) console.time("convertType");
  const ctx = new ConvertTypeContext(new SchemaGenContext(testProject), node);
  const actual = convertType(ctx, type, { variant: "type", type });
  if (time) console.timeEnd("convertType");
  return tm.printNode(actual);
};
