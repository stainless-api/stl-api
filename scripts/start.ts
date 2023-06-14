import { Project, printNode } from "ts-morph";
import * as path from "path";
import { convertType } from "../src/convertType";

function main(fileName: string) {
  const project = new Project({
    tsConfigFilePath: path.resolve(__dirname, "..", "tsconfig.json"),
  });
  const sourceFile = project.addSourceFileAtPath(fileName);
  const node =
    sourceFile.getTypeAlias("T") ||
    sourceFile.getInterface("T") ||
    sourceFile.getEnum("T");
  if (!node) throw new Error("failed to find type node to generate");
  const ctx = {
    project,
    typeChecker: project.getTypeChecker(),
    node,
  };
  const type = node.getType();
  if (!type) throw new Error(`type not found`);
  console.log(printNode(convertType(ctx, type)));
}

main(path.resolve(__dirname, "../test_code/simple.ts"));
