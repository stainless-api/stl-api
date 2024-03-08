import { ts } from "ts-morph";
import * as tm from "ts-morph";
export interface Diagnostics {
    errors: Incident[];
    warnings: Incident[];
}
interface Position {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}
export interface Incident {
    message: string;
    position?: Position;
    name?: string;
    typeText?: string;
    propertyName?: string;
}
export type DiagnosticItem = {
    variant: "node";
    node: tm.Node;
} | {
    variant: "type";
    type: tm.Type;
} | {
    variant: "property";
    name: string;
    symbol: tm.Symbol;
    enclosingType: tm.Type;
};
export declare class ErrorAbort extends Error {
}
export declare class SchemaGenContext {
    project: tm.Project;
    typeChecker: tm.TypeChecker;
    files: Map<string, FileInfo>;
    symbols: Set<tm.Symbol>;
    diagnostics: Map<string, Diagnostics>;
    generateInUserFile?: boolean | undefined;
    constructor(project: tm.Project, typeChecker?: tm.TypeChecker, files?: Map<string, FileInfo>, symbols?: Set<tm.Symbol>, diagnostics?: Map<string, Diagnostics>, generateInUserFile?: boolean | undefined);
    getFileInfo(filePath: string): FileInfo;
    /** Returns the filePath corresponding to the location of the incident, and adds
     * location information to the given incident if relevant.
     */
    private processIncident;
    addError(item: DiagnosticItem, incident: Incident, abort: true): never;
    addError(item: DiagnosticItem, incident: Incident, abort?: boolean): void;
    addWarning(item: DiagnosticItem, incident: Incident): void;
}
export declare class ConvertTypeContext extends SchemaGenContext {
    node: tm.Node;
    constructor(ctx: SchemaGenContext, node: tm.Node);
    isRoot: boolean;
    currentFilePath: string;
    isSymbolImported(symbol: tm.Symbol): boolean;
}
export declare function isDeclarationImported(declaration: tm.Node): boolean;
export interface ImportInfo {
    sourceFile: string;
    as?: string;
    /**
     * If true, the output code will import from
     * the original file associated with the import's symbol; otherwise
     * it will import from the generated file associated with
     * `symbol`.
     */
    importFromUserFile?: boolean;
    /** Whether this import shouldn't be imported into a user file when using `stl.codegenSchema`. */
    excludeFromUserFile?: boolean;
}
export interface NamespaceImportInfo {
    importFromUserFile?: boolean;
    sourceFile: string;
}
export interface FileInfo {
    imports: Map<string, ImportInfo>;
    /** imports all the contents from the module with the given file path */
    namespaceImports: Map<string, NamespaceImportInfo>;
    generatedSchemas: Map<string, GeneratedSchema>;
    moduleIdentifiers: {
        userModules: Map<string, ts.Identifier>;
        generatedModules: Map<string, ts.Identifier>;
    };
    /** maps imported type id to local identifier it's imported as */
    importTypeNameMap?: Map<number, string>;
}
export declare function processModuleIdentifiers(fileInfo: FileInfo): void;
export declare function prefixValueWithModule(ctx: SchemaGenContext, name: string, currentFilePath: string, valueFilePath: string, importFromUserFile: boolean, escapedName?: string): ts.Expression;
interface GeneratedSchema {
    name: string;
    expression: ts.Expression;
    isExported: boolean;
    /**
     * The type for the schema value to generate in d.ts.
     * Defaults to `z.ZodTypeAny`.
     */
    type?: ts.TypeNode;
    /** Whether the type shouldn't be exported from the definition file. Defaults to false. */
    private?: boolean;
}
export declare function convertSymbol(ctx: SchemaGenContext, symbol: tm.Symbol, diagnosticItem: DiagnosticItem, 
/** use the type for schema generation instead of attempting to resolve it */
ty?: tm.Type): ts.Expression;
export declare function convertType(ctx: ConvertTypeContext, ty: tm.Type, diagnosticItem: DiagnosticItem, 
/**
 * If true, forces generation for the current type instead of using `z.lazy()`.
 */
generateInline?: boolean): ts.Expression;
export declare function methodCall(target: ts.Expression, name: string, args?: readonly ts.Expression[]): ts.Expression;
export declare function isDeclarationExported(declaration: tm.Node): boolean;
export declare function getTypeFilePath(type: tm.Type): string | undefined;
export declare function getDeclaration(symbol: tm.Symbol): tm.Node | undefined;
export declare function getPropertyDeclaration(symbol: tm.Symbol): tm.PropertyDeclaration | tm.PropertySignature | undefined;
export {};
//# sourceMappingURL=convertType.d.ts.map