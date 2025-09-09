type IncludeSubPaths<E extends string, Path extends string> = E extends `${Path}.${infer SubPath}` ? SubPath : never;
export declare function includeSubPaths<S extends string[], P extends string>(include: S, path: P): IncludeSubPaths<S[number], P>[];
export {};
//# sourceMappingURL=includeUtils.d.ts.map