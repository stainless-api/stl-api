import { existsSync, mkdirSync, writeFileSync } from "fs";
import { generateOutput } from "../codegen/types";
import { join } from "path";

const outputFile = generateOutput();
const generatedDirName = "generated";
const outputFileName = "output.ts";
const generatedDirPath = join(generatedDirName);
const outputFilePath = join(generatedDirPath, outputFileName);

if (!existsSync(generatedDirPath)) {
  mkdirSync(generatedDirPath);
}

writeFileSync(outputFilePath, outputFile);
