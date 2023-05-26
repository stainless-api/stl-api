import * as url from "node:url";

export function isMainModule(meta) {
  if (meta.url.startsWith("file:")) {
    const modulePath = url.fileURLToPath(meta.url);
    console.log(process.argv[1], modulePath);
    return process.argv[1] === modulePath;
  }
  return false;
}
