export type GenLocationOptions = {
    type: "alongside";
    dependencyGenPath: string;
    suffix?: string;
} | {
    type: "folder";
    genPath: string;
};
export interface GenOptions {
    genLocation: GenLocationOptions;
    /**
     * the project root (where package.json resides) from which generation
     * paths are resolved
     */
    rootPath: string;
    /** the package from where to import the `z` constant */
    zPackage?: string;
    moduleType?: "commonjs" | "module";
}
export interface GenerationConfig {
    basePath: string;
    baseDependenciesPath: string;
    rootPath: string;
    suffix?: string;
    zPackage?: string;
    moduleType: "commonjs" | "module";
}
export declare function createGenerationConfig(options: GenOptions): GenerationConfig;
//# sourceMappingURL=filePathConfig.d.ts.map