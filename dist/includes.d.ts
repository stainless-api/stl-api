import { z, StlContext } from "./stl";
/**
 * Creates an include param from all includable paths in the given zod schema
 */
export declare function includes<T extends z.ZodTypeAny, Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3>(schema: T, depth?: Depth): z.ZodMetadata<z.ZodType<IncludablePaths<z.output<T>, Depth>[]>, {
    stainless: {
        includes: true;
    };
}>;
export type IncludableKeys<Model> = Model extends object ? {
    [K in keyof Model & string]-?: NonNullable<Model[K]> extends z.IncludableOutput<unknown> ? K : never;
}[keyof Model & string] : never;
type Decrement = [0, 0, 1, 2, 3, 4, 5];
export type IncludablePaths<Model, Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3> = Model extends object ? IncludableKeys<Model> | (Depth extends 0 ? never : {
    [K in keyof Model & string]-?: NonNullable<Model[K]> extends z.IncludableOutput<(infer T extends object)[]> ? `${K}.${IncludablePaths<T, Decrement[Depth]>}` : NonNullable<Model[K]> extends z.IncludableOutput<null | undefined | infer T extends object> ? `${K}.${IncludablePaths<NonNullable<T>, Decrement[Depth]>}` : NonNullable<Model[K]> extends Array<infer T> ? `${K}.${IncludablePaths<T, Decrement[Depth]>}` : never;
}[keyof Model & string]) : never;
export declare function getIncludes(ctx: StlContext<any>): string[] | null | undefined;
export {};
//# sourceMappingURL=includes.d.ts.map