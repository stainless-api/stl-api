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
  try {
    return prettier.format(source, config || { filepath });
  } catch (error) {
    console.error(
      `failed to format code for ${path.relative(process.cwd(), filepath)} ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return source;
  }
}
