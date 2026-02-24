/// <reference types="node" />
/// <reference types="lodash" />
import * as tm from "ts-morph";
import fs from "fs";
export declare function statOrExit(path: string): Promise<fs.Stats>;
export declare function pathExists(path: string): Promise<boolean>;
export declare function isSymbolStlMethod(symbol: tm.Symbol): boolean;
export declare function mangleRouteToIdentifier(str: string): string;
export declare function convertPathToImport(path: string): string;
export declare const resolve: ((specifier: string, basedir: string) => Promise<string | undefined>) & import("lodash").MemoizedFunction;
//# sourceMappingURL=utils.d.ts.map