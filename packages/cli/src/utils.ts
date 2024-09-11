import * as tm from "ts-morph";
import Path from "path";
import fs from "fs";
import memoize from "lodash/memoize";
import { promisify } from "util";
import _resolve from "resolve";

export async function statOrExit(path: string): Promise<fs.Stats> {
  try {
    return await fs.promises.stat(path);
  } catch (e: any) {
    console.error(`${e}.`);
    process.exit(1);
  }
}

export function pathExists(path: string): Promise<boolean> {
  return fs.promises.stat(path).then(
    () => true,
    () => false,
  );
}

export function isSymbolStlMethod(symbol: tm.Symbol): boolean {
  const symbolDeclaration = symbol.getDeclarations()[0];
  if (!symbolDeclaration) return false;
  const symbolDeclarationFile = symbolDeclaration.getSourceFile().getFilePath();

  return symbolDeclarationFile.endsWith("stl.d.ts");
}

export function mangleRouteToIdentifier(str: string): string {
  let pathSep = "_";
  for (const match of str.matchAll(/_+/g)) {
    if (match.length >= pathSep.length) pathSep = match[0] + "_";
  }

  const unicodeLetterRegex = /\p{L}/u;
  const escapedStringBuilder = [];
  for (const codePointString of str) {
    if (codePointString === " ") {
      escapedStringBuilder.push("_");
    } else if (codePointString === "/") {
      escapedStringBuilder.push(pathSep);
    } else if (codePointString === "{" || codePointString === "}") {
      escapedStringBuilder.push("$");
    } else if (unicodeLetterRegex.test(codePointString)) {
      escapedStringBuilder.push(codePointString);
    } else {
      escapedStringBuilder.push(`$${codePointString.codePointAt(0)}`);
    }
  }
  return escapedStringBuilder.join("");
}

function absoluteNodeModulesPath(path: string): string {
  const splitPath = path.split(Path.sep);
  for (let i = 0; i < splitPath.length; i++) {
    if (splitPath[i] === "node_modules") {
      return Path.join(...splitPath.slice(i + 1));
    }
  }
  return path;
}

export function convertPathToImport(path: string): string {
  const withAbsolute = absoluteNodeModulesPath(path);
  // strip extension from path
  // todo: we probably need to handle modules as well
  const { dir, name } = Path.parse(withAbsolute);
  return Path.join(dir, name);
}

export const resolve = memoize(
  async (specifier: string, basedir: string): Promise<string | undefined> => {
    // sometimes we'll be trying to resolve prettier for a codegen output dir
    // that doesn't exist yet
    while (!(await pathExists(basedir))) {
      basedir = Path.dirname(basedir);
    }

    return await promisify<string | undefined>((cb) =>
      _resolve(specifier, { basedir }, cb),
    )();
  },
  (specifier: string, basedir: string) =>
    JSON.stringify({ specifier, basedir }),
);
