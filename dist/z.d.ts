import { z, ParseContext, SafeParseReturnType } from "zod";
import { StlContext } from "./stl";
export * from "zod";
export { selects } from "./selects";
export { expands } from "./expands";
declare module "zod" {
    interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
        /**
         * Adds stainless metadata properties to the def.
         */
        stlMetadata<M extends StlMetadata>(metadata: M): WithStlMetadata<this, M>;
    }
}
export declare const stlMetadataSymbol: unique symbol;
export interface StlMetadata {
    expandable?: true;
    selectable?: true;
    expands?: true;
    selects?: true;
    response?: true;
    pageResponse?: true;
    prismaModel?: any;
    from?: string;
}
export type WithStlMetadata<T extends z.ZodTypeAny, M extends StlMetadata> = T & {
    _def: {
        [stlMetadataSymbol]: M;
    };
};
export type ExtractStlMetadata<T extends z.ZodTypeAny> = z.ZodType<any, z.ZodTypeDef, any> extends T ? never : T["_def"] extends {
    [stlMetadataSymbol]: infer M extends StlMetadata;
} ? M : T extends z.ZodOptional<infer U> ? ExtractStlMetadata<U> : T extends z.ZodNullable<infer U> ? ExtractStlMetadata<U> : T extends z.ZodDefault<infer U> ? ExtractStlMetadata<U> : T extends z.ZodLazy<infer U> ? ExtractStlMetadata<U> : T extends z.ZodEffects<infer U> ? ExtractStlMetadata<U> : T extends z.ZodCatch<infer U> ? ExtractStlMetadata<U> : T extends z.ZodBranded<infer U, infer Brand> ? ExtractStlMetadata<U> : T extends z.ZodArray<infer U> ? ExtractStlMetadata<U> : T extends z.ZodPromise<infer U> ? ExtractStlMetadata<U> : T extends z.ZodSet<infer U> ? ExtractStlMetadata<U> : T extends z.ZodPipeline<infer A, infer U> ? ExtractStlMetadata<U> : never;
export declare function extractStlMetadata<T extends z.ZodTypeAny>(schema: T): StlMetadata;
declare module "zod" {
    interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
        /**
         * Marks this schema as expandable via an `expand[]` query param.
         * This should only be used on object or array of object property schemas.
         */
        expandable(): ExpandableZodType<this>;
    }
}
export declare const expandableSymbol: unique symbol;
export type ExpandableOutput<T> = (NonNullable<T> & {
    readonly [expandableSymbol]: {
        value: T;
    };
}) | null | undefined;
export type ExpandableInput<T> = T | null | undefined;
export type ExpandableZodType<T extends z.ZodTypeAny> = z.ZodType<ExpandableOutput<z.output<T>>, T["_def"] & {
    [stlMetadataSymbol]: {
        expandable: true;
    };
}, ExpandableInput<z.input<T>>>;
export type ExpandableZodArrayType<T extends z.ZodTypeAny> = z.ZodType<ExpandableOutput<z.output<T>[]>, z.ZodArrayDef & {
    [stlMetadataSymbol]: {
        expandable: true;
    };
}, ExpandableInput<z.input<T>[]>>;
declare module "zod" {
    interface ZodTypeDef {
    }
    interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
        selection<T extends z.ZodTypeAny>(this: T): z.ZodType<Selection<z.output<T>>, this["_def"], Selection<z.input<T>>>;
        /**
         * Marks this schema as selectable via a `select` query param.
         * This should only be used on object or array of object property schemas.
         * The property must have the name of a sibling property + `_fields`.
         */
        selectable(): SelectableZodType<this>;
    }
}
export declare const selectableSymbol: unique symbol;
export type SelectableOutput<T> = ((NonNullable<T> extends Array<infer E> ? Partial<E>[] : NonNullable<T> extends object ? Partial<NonNullable<T>> : T) & {
    readonly [selectableSymbol]: true;
}) | null | undefined;
export type SelectableInput<T> = T | (NonNullable<T> extends Array<infer E extends object> ? Partial<E>[] : NonNullable<T> extends object ? Partial<NonNullable<T>> : T) | null | undefined;
export type SelectableZodType<T extends z.ZodTypeAny> = z.ZodType<SelectableOutput<z.output<T>>, T["_def"] & {
    [stlMetadataSymbol]: {
        selectable: true;
    };
}, SelectableInput<z.input<T>>>;
export type SelectableZodArrayType<T extends z.ZodTypeAny> = z.ZodType<SelectableOutput<z.output<T>[]>, z.ZodArrayDef & {
    [stlMetadataSymbol]: {
        selectable: true;
    };
}, SelectableInput<z.input<T>[]>>;
export type Selection<T> = T extends Array<infer E extends object> ? Partial<E>[] : T extends object ? Partial<T> : T;
declare module "zod" {
    interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
        safeParseAsync(data: unknown, params?: Partial<StlParseParams>): Promise<SafeParseReturnType<Input, Output>>;
        parseAsync(data: unknown, params?: Partial<StlParseParams>): Promise<Output>;
        transform<T extends z.ZodTypeAny, NewOut>(this: T, transform: (arg: Output, ctx: StlRefinementCtx) => NewOut | Promise<NewOut>): z.ZodEffects<T, NewOut>;
        /**
         * Like `.transform()`, but passes the StlContext and ParseContext
         * to the transform.
         * Currently this is used to implement `.prismaModelLoader()` in the
         * Prisma plugin.
         */
        stlTransform<T extends z.ZodTypeAny, NewOut>(this: T, transform: StlTransform<Output, NewOut>): z.ZodEffects<T, NewOut>;
    }
}
export type StlTransform<Output, NewOut> = (arg: Output, ctx: StlContext<any>, parseContext: ParseContext) => NewOut | Promise<NewOut>;
export interface StlParseContext extends z.ParseContext {
    stlContext?: StlContext<any>;
}
export interface StlRefinementCtx extends z.RefinementCtx {
    stlContext?: StlContext<any>;
}
export type StlParseParams = z.ParseParams & {
    stlContext: StlContext<any>;
};
export type StlParseInput = z.ParseInput & {
    parent: StlParseContext;
};
export declare function path<T extends z.ZodRawShape>(shape: T, params?: z.RawCreateParams): z.ZodObject<T, "strip">;
export declare class StlParams<T extends z.ZodRawShape, UnknownKeys extends z.UnknownKeysParam = z.UnknownKeysParam, Catchall extends z.ZodTypeAny = z.ZodTypeAny, Output = z.objectOutputType<T, Catchall, UnknownKeys>, Input = z.objectInputType<T, Catchall, UnknownKeys>> extends z.ZodObject<T, UnknownKeys, Catchall, Output, Input> {
}
export declare function query<T extends z.ZodRawShape>(shape: T, params?: z.RawCreateParams): StlParams<T, "strip">;
export declare function body<T extends z.ZodRawShape>(shape: T, params?: z.RawCreateParams): StlParams<T, "strip">;
export declare function response<T extends z.ZodRawShape>(shape: T, params?: z.RawCreateParams): WithStlMetadata<z.ZodObject<T, "strip">, {
    response: true;
}>;
declare class PageResponseWrapper<I extends z.ZodTypeAny> {
    wrapped(item: I): z.ZodObject<{
        items: z.ZodArray<I, "many">;
        startCursor: z.ZodNullable<z.ZodString>;
        endCursor: z.ZodNullable<z.ZodString>;
        hasNextPage: z.ZodOptional<z.ZodBoolean>;
        hasPreviousPage: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        items: I["_output"][];
        startCursor: string | null;
        endCursor: string | null;
        hasNextPage?: boolean | undefined;
        hasPreviousPage?: boolean | undefined;
    }, {
        items: I["_input"][];
        startCursor: string | null;
        endCursor: string | null;
        hasNextPage?: boolean | undefined;
        hasPreviousPage?: boolean | undefined;
    }>;
}
export declare function pageResponse<I extends z.ZodTypeAny>(item: I): WithStlMetadata<ReturnType<PageResponseWrapper<I>["wrapped"]>, ExtractStlMetadata<I> & {
    pageResponse: true;
}>;
export type PageData<I> = {
    items: I[];
    startCursor: string | null;
    endCursor: string | null;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
};
export type PageItemType<D extends PageData<any>> = D["items"][number];
export declare const AnyPageData: z.ZodType<PageData<any>, any, PageData<any>>;
export declare const SortDirection: z.ZodUnion<[z.ZodLiteral<"asc">, z.ZodLiteral<"desc">]>;
export type SortDirection = z.infer<typeof SortDirection>;
export declare const PaginationParams: z.ZodObject<{
    pageAfter: z.ZodOptional<z.ZodString>;
    pageBefore: z.ZodOptional<z.ZodString>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodString;
    sortDirection: z.ZodDefault<z.ZodUnion<[z.ZodLiteral<"asc">, z.ZodLiteral<"desc">]>>;
}, "strip", z.ZodTypeAny, {
    pageSize: number;
    sortBy: string;
    sortDirection: "asc" | "desc";
    pageAfter?: string | undefined;
    pageBefore?: string | undefined;
}, {
    sortBy: string;
    pageAfter?: string | undefined;
    pageBefore?: string | undefined;
    pageSize?: number | undefined;
    sortDirection?: "asc" | "desc" | undefined;
}>;
export type PaginationParams = z.infer<typeof PaginationParams>;
export type CircularModel<Base extends z.ZodType<object, any, object>, Props extends z.ZodRawShape> = z.ZodType<z.output<Base> & {
    [K in keyof Props]: z.output<NonNullable<Props[K]>>;
}, z.ZodTypeDef, z.input<Base> & {
    [K in keyof Props]: z.input<NonNullable<Props[K]>>;
}>;
//# sourceMappingURL=z.d.ts.map