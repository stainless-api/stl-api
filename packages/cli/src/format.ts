import { promisify } from "util";
import path from "path";
import resolve from "resolve";
import defaultPrettier from "prettier";

export async function format(
  source: string,
  filepath: string
): Promise<string> {
  let prettier = defaultPrettier;

  try {
    const prettierPath = await promisify<string | undefined>((cb) =>
      resolve("prettier", { basedir: path.dirname(filepath) }, cb)
    )();
    if (prettierPath) {
      prettier = await import(prettierPath);
    }
  } catch (error) {}

  const config = await prettier.resolveConfig(filepath);
  return prettier.format(source, config || { filepath });
}
