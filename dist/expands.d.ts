import { z, StlContext } from "./stl";
/**
 * Creates an expand param from all expandable paths in the given zod schema
 */
export declare function expands<T extends z.ZodTypeAny, Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3>(schema: T, depth?: Depth): z.WithStlMetadata<z.ZodType<ExpandablePaths<z.output<T>, Depth>[]>, {
    expands: true;
}>;
/**
 * Given an zod schema from `expands`, extracts the possible options
 */
export declare function expandsOptions<V extends string[]>(param: z.ZodType<V>): V;
export type ExpandableKeys<Model> = Model extends object ? {
    [K in keyof Model & string]-?: NonNullable<Model[K]> extends z.ExpandableOutput<unknown> ? K : never;
}[keyof Model & string] : never;
type Decrement = [0, 0, 1, 2, 3, 4, 5];
export type ExpandablePaths<Model, Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3> = Model extends object ? ExpandableKeys<Model> | (Depth extends 0 ? never : {
    [K in keyof Model & string]-?: NonNullable<Model[K]> extends z.ExpandableOutput<(infer T extends object)[]> ? `${K}.${ExpandablePaths<T, Decrement[Depth]>}` : NonNullable<Model[K]> extends z.ExpandableOutput<null | undefined | infer T extends object> ? `${K}.${ExpandablePaths<NonNullable<T>, Decrement[Depth]>}` : NonNullable<Model[K]> extends Array<infer T> ? `${K}.${ExpandablePaths<T, Decrement[Depth]>}` : never;
}[keyof Model & string]) : never;
type ExpandSubPaths<E extends string, Path extends string> = E extends `${Path}.${infer SubPath}` ? SubPath : never;
export declare function expandSubPaths<S extends string[], P extends string>(expand: S, path: P): ExpandSubPaths<S[number], P>[];
export declare function getExpands(ctx: StlContext<any>): string[] | null | undefined;
export {};
//# sourceMappingURL=expands.d.ts.map