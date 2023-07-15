import path from "path";
import defaultPrettier from "prettier";
import { resolve } from "./utils";

export async function format(
  source: string,
  filepath: string
): Promise<string> {
  let prettier = defaultPrettier;

  try {
    const prettierPath = await resolve("prettier", path.dirname(filepath));
    if (prettierPath) prettier = await import(prettierPath);
  } catch (error) {
    // ignore
  }

  const config = await prettier.resolveConfig(filepath);
  return prettier.format(source, config || { filepath });
}
