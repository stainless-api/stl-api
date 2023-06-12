import * as ts from "ts-morph";
import fs from "fs/promises";
import { getApiMetadata } from "./getApiMetadata";
import path from "path";

const project = new ts.Project({
  tsConfigFilePath: require.resolve("../../../../demo/tsconfig.json"),
});

async function go() {
  for (const file of project.getSourceFiles()) {
    for (const createCall of findCreateClientCalls(file)) {
      const [typeArg] = createCall.getTypeArguments();
      if (!typeArg.isKind(ts.SyntaxKind.TypeQuery)) continue;
      const exprName = typeArg.getExprName();
      if (exprName.isKind(ts.SyntaxKind.Identifier)) {
        for (const def of exprName.getDefinitionNodes()) {
          const apiSourceFile = def.getSourceFile().getFilePath();
          console.log({
            file: apiSourceFile,
            text: def.getFullText(),
          });
          if (!def.isKind(ts.SyntaxKind.VariableDeclaration)) continue;
          const apiName = def.getName();
          console.log({ name: apiName });
          const metadataFile = apiSourceFile.replace(
            /(\.[^.])$/,
            `-${apiName}-metadata$1`
          );
          const loaded = await import(apiSourceFile);
          const api = loaded[apiName];
          if (!api) continue;
          await fs.writeFile(
            metadataFile,
            `export default ${JSON.stringify(getApiMetadata(api))}`
          );
          console.error(`write ${path.relative(process.cwd(), metadataFile)}`);
        }
      }
    }
  }
}
go();

function* findCreateClientCalls(
  file: ts.SourceFile
): Iterable<ts.CallExpression> {
  const createClientId = findCreateClientId(file);

  if (!createClientId) return;
  for (const ref of createClientId.findReferencesAsNodes()) {
    const createCall = ref.getFirstAncestorByKind(ts.SyntaxKind.CallExpression);
    if (createCall?.getExpression() !== ref) continue;
    yield createCall;
  }
}

function findCreateClientId(file: ts.SourceFile): ts.Identifier | undefined {
  for (const decl of file.getImportDeclarations()) {
    if (decl.getModuleSpecifier().getLiteralValue() === "stainless") {
      const namedBindings = decl.getImportClause()?.getNamedBindings();
      if (!(namedBindings instanceof ts.NamedImports)) continue;
      for (const specifier of namedBindings.getElements()) {
        if (specifier.getName() === "createClient") {
          return specifier.getAliasNode() || specifier.getNameNode();
        }
      }
    }
  }
}
