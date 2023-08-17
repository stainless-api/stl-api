import { SelectTree } from "./parseSelect.js";
import * as z from "./z.js";
import { type StlContext } from "./stl.js";
export declare const selectsSymbol: unique symbol;
/**
 * Creates an select param from all selectable paths in the given zod schema
 */
export declare function selects<T extends z.ZodType<object>, Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3>(schema: T, depth?: Depth): z.ZodMetadata<z.ZodType<SelectTree | null | undefined, z.ZodEffectsDef, string>, {
    stainless: {
        selects: true;
    };
}>;
export declare function getSelects(ctx: StlContext<any>): SelectTree | null | undefined;
//# sourceMappingURL=selects.d.ts.map