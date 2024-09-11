import { existsSync, mkdirSync, writeFileSync } from "fs";
import * as ReactQuery from "@tanstack/react-query";
import { generateOutput } from "../codegen/generate-types";
import { join } from "path";
import { api, config } from "../test-util/api-server";

export async function writeGeneratedTypes({
  generatedDirName,
  outputFileName,
  installLocation,
}: {
  generatedDirName: string;
  outputFileName: string;
  installLocation?: string;
}) {
  const outputFile = await generateOutput(
    api,
    {
      ...config,
      extensions: { reactQuery: ReactQuery },
    },
    installLocation,
  );
  const generatedDirPath = join(process.cwd(), generatedDirName);
  const outputFilePath = join(generatedDirPath, outputFileName);
  console.log(`Generating API client types to ${outputFilePath}`);

  if (!existsSync(generatedDirPath)) {
    mkdirSync(generatedDirPath);
  }

  writeFileSync(outputFilePath, outputFile);
}

if (require.main === module) {
  const [_path, _pathToFile, dir, file, installLocation] = process.argv;

  writeGeneratedTypes({
    generatedDirName: dir,
    outputFileName: file,
    installLocation,
  });
}
