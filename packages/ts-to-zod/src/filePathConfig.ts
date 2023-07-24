import Path from "path";

const DEFAULT_ALONGSIDE_SUFFIX = "codegen";

export type GenLocationOptions =
  | { type: "alongside"; dependencyGenPath: string; suffix?: string }
  | { type: "folder"; genPath: string };

export interface GenOptions {
  genLocation: GenLocationOptions;
  /**
   * the project root (where package.json resides) from which generation
   * paths are resolved
   */
  rootPath: string;
  /** the package from where to import the `z` constant */
  zPackage?: string;
}

// produced via the _
export interface GenerationConfig {
  basePath: string;
  baseDependenciesPath: string;
  rootPath: string;
  suffix?: string;
  zPackage?: string;
}

export function createGenerationConfig(options: GenOptions): GenerationConfig {
  let basePath: string;
  let baseDependenciesPath: string;
  let suffix: string | undefined;

  switch (options.genLocation.type) {
    case "alongside":
      basePath = options.rootPath;
      baseDependenciesPath = Path.join(
        basePath,
        options.genLocation.dependencyGenPath
      );
      suffix = options.genLocation.suffix || DEFAULT_ALONGSIDE_SUFFIX;
      break;
    case "folder":
      basePath = Path.join(options.rootPath, options.genLocation.genPath);
      baseDependenciesPath = Path.join(basePath, "zod_schema_node_modules");
      break;
  }

  return {
    basePath,
    baseDependenciesPath,
    suffix,
    rootPath: options.rootPath,
    zPackage: options.zPackage,
  };
}
