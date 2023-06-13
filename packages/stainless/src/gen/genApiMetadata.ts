import fs from "fs/promises";
import path from "path";
import "../util/fetch-polyfill";
import { APIMetadata, isAPIDescription } from "../stl";
import { getApiMetadata } from "./getApiMetadata";

export async function genApiMetadata(apiSourceFile: string) {
  const metadataFile = apiSourceFile.replace(/(\.[^.]+)$/, `-metadata$1`);
  if (metadataFile === apiSourceFile) return;
  const loaded = await import(apiSourceFile);
  const metadata: [string, APIMetadata][] = [];
  for (const key of Object.keys(loaded)) {
    const api = loaded[key];
    if (isAPIDescription(api)) {
      metadata.push([key, getApiMetadata(api)]);
    }
  }
  if (!metadata.length) return;
  await fs.writeFile(
    metadataFile,
    [
      'import { APIMetadata } from "stainless";',
      ...metadata.map(
        ([name, metadata]) =>
          `export const ${name}: APIMetadata = ${JSON.stringify(
            metadata,
            null,
            2
          )};`
      ),
    ].join("\n\n"),
    "utf8"
  );
  console.error(`wrote ${path.relative(process.cwd(), metadataFile)}`);
}
