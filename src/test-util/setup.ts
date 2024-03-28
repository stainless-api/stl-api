import { beforeAll } from "vitest";
import { writeGeneratedTypes } from "../scripts/run-codegen";

beforeAll(async () => {
  // await writeGeneratedTypes({
  //   generatedDirName: "src/test-util",
  //   outputFileName: "generated-api-types.ts",
  //   installLocation: "../index",
  // });
});
