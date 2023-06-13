import path from "path";
import { APIMetadata, isAPIDescription } from "../stl";
import { getApiMetadata } from "./getApiMetadata";
import "../util/fetch-polyfill";

export async function genApiMetadata(apiSourceFile: string) {
  const metadataFile = apiSourceFile.replace(/(\.[^.]+)$/, `-metadata$1`);
  if (metadataFile === apiSourceFile) return;
  const loaded = await import(
    apiSourceFile.startsWith("./") ? apiSourceFile : path.resolve(apiSourceFile)
  );
  const metadata: [string, APIMetadata][] = [];
  for (const key of Object.keys(loaded)) {
    const api = loaded[key];
    if (isAPIDescription(api)) {
      metadata.push([key, getApiMetadata(api)]);
    }
  }
  if (!metadata.length) return;
  const fs = await import(/* webpackIgnore */ "fs/promises");
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
