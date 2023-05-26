import { z } from "stainless";
/**
 * Given an zod schema from `expands`, extracts the possible options
 */
export declare function expandsOptions<V extends string[]>(param: z.ZodType<V>): V;
type ExpandSubPaths<E extends string, Path extends string> = E extends `${Path}.${infer SubPath}` ? SubPath : never;
export declare function expandSubPaths<S extends string[], P extends string>(expand: S, path: P): ExpandSubPaths<S[number], P>[];
/**
 * Given a set of expands like `['items.user', 'items.comments.user']`, adds
 * parent paths, so the result is
 * `new Set(['items', 'items.user', 'items.comments', 'items.comments.user'])`
 */
export declare function addExpandParents(expand: string[]): Set<string>;
export {};
//# sourceMappingURL=expandsUtils.d.ts.map