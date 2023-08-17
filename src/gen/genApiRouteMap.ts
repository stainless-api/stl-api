import path from "path";
import { APIRouteMap, isAPIDescription } from "../stl.js";
import { getApiRouteMap } from "./getApiRouteMap.js";
import "../util/fetch-polyfill.js";

export async function genApiRouteMap(apiSourceFile: string) {
  const metadataFile = apiSourceFile.replace(/(\.[^.]+)$/, `-route-map$1`);
  if (metadataFile === apiSourceFile) return;
  const loaded = await import(
    apiSourceFile.startsWith("./") ? apiSourceFile : path.resolve(apiSourceFile)
  );
  const metadata: [string, APIRouteMap][] = [];
  for (const key of Object.keys(loaded)) {
    const api = loaded[key];
    if (isAPIDescription(api)) {
      metadata.push([key, getApiRouteMap(api)]);
    }
  }
  if (!metadata.length) return;
  const fs = await import(/* webpackIgnore */ "fs/promises");
  await fs.writeFile(
    metadataFile,
    [
      'import { APIRouteMap } from "stainless";',
      ...metadata.map(
        ([name, metadata]) =>
          `export const ${name}: APIRouteMap = ${JSON.stringify(
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
