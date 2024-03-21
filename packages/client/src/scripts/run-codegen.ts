import { existsSync, mkdirSync, writeFileSync } from "fs";
import * as ReactQuery from "@tanstack/react-query";
import { generateOutput } from "../codegen/types";
import { join } from "path";
import { api, config } from "../test-util/api-server";

export function writeGeneratedTypes({
  generatedDirName,
  outputFileName,
}: {
  generatedDirName: string;
  outputFileName: string;
}) {
  const outputFile = generateOutput(api, {
    ...config,
    extensions: { reactQuery: ReactQuery },
  });
  const generatedDirPath = join(generatedDirName);
  const outputFilePath = join(generatedDirPath, outputFileName);
  console.log(`Generating API client types to ${outputFilePath}`);

  if (!existsSync(generatedDirPath)) {
    mkdirSync(generatedDirPath);
  }

  writeFileSync(outputFilePath, outputFile);
}

if (require.main === module) {
  writeGeneratedTypes({
    generatedDirName: "generated",
    outputFileName: "output.ts",
  });
}
