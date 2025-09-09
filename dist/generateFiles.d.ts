import { NamespaceImportInfo as NamespaceImportInfo, ImportInfo, SchemaGenContext } from "./convertType";
import { ts } from "ts-morph";
import { GenerationConfig } from "./filePathConfig";
export declare function generateFiles(ctx: SchemaGenContext, generationConfig: GenerationConfig): Map<string, ts.Statement[]>;
export declare function relativeImportPath(importingFile: string, importedFile: string): string;
/** Returns the path in which to generate schemas for an input path. Generates without a file extension. */
export declare function generatePath(path: string, { basePath, baseDependenciesPath, rootPath, suffix }: GenerationConfig): string;
export declare function generateImportStatements(config: GenerationConfig, filePath: string, imports: Map<string, ImportInfo>, namespaceImports: Map<string, NamespaceImportInfo>, moduleIdentifiers?: {
    userModules: Map<string, ts.Identifier>;
    generatedModules: Map<string, ts.Identifier>;
}): ts.ImportDeclaration[];
//# sourceMappingURL=generateFiles.d.ts.map