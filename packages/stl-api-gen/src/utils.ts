import * as tm from "ts-morph";
import Path from "path";

export function isSymbolStlMethod(symbol: tm.Symbol): boolean {
  const symbolDeclaration = symbol.getDeclarations()[0];
  if (!symbolDeclaration) return false;
  const symbolDeclarationFile = symbolDeclaration.getSourceFile().getFilePath();

  return symbolDeclarationFile.indexOf("stl.d.ts") >= 0;
}

export function mangleString(str: string): string {
  const unicodeLetterRegex = /\p{L}/u;
  const escapedStringBuilder = ["__"];
  for (const codePointString of str) {
    if (codePointString === "/") {
      escapedStringBuilder.push("$");
    } else if (unicodeLetterRegex.test(codePointString)) {
      escapedStringBuilder.push(codePointString);
    } else {
      escapedStringBuilder.push(`u${codePointString.codePointAt(0)}`);
    }
  }
  return escapedStringBuilder.join("");
}

function absoluteNodeModulesPath(path: string): string {
  const nodeModulesPos = path.lastIndexOf("node_modules");
  if (nodeModulesPos >= 0) {
    return path.substring(nodeModulesPos + 13);
  } else return path;
}

export function convertPathToImport(path: string): string {
  const withAbsolute = absoluteNodeModulesPath(path);
  // strip extension from path
  // todo: we probably need to handle modules as well
  const { dir, name } = Path.parse(withAbsolute);
  return Path.join(dir, name);
}
