import { z, SafeParseReturnType } from "zod";
import { StlContext } from "./stl";
export * from "zod";
export { selects } from "./selects";
export { includes } from "./includes";
declare module "zod" {
    interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
        withMetadata<M extends object>(metadata: M): ZodMetadata<this, M>;
    }
}
export interface ZodMetadataDef<T extends z.ZodTypeAny, M extends object> extends z.ZodEffectsDef {
    innerType: T;
    metadata: M;
}
/**
 * Class for storing custom metadata like `prismaModel`,
 * `pageResponse: true`, `includable: true`, etc.
 *
 * zod-openapi errors out on any new class that extends the base
 * ZodType, so I made this extend a no-op refinement for compatibility.
 * Extending ZodLazy would be another option
 */
export declare class ZodMetadata<T extends z.ZodTypeAny, M extends object> extends z.ZodEffects<T> {
    metadata: M;
    constructor(def: z.ZodEffectsDef<T>, metadata: M);
    unwrap(): T;
    static create: <T_1 extends z.ZodTypeAny, M_1 extends object>(innerType: T_1, metadata: M_1, params?: z.RawCreateParams) => ZodMetadata<T_1, M_1>;
}
export declare const withMetadata: <T extends z.ZodTypeAny, M extends object>(innerType: T, metadata: M, params?: z.RawCreateParams) => ZodMetadata<T, M>;
export type extractMetadata<T extends z.ZodTypeAny, Satisfying extends object = object> = z.ZodType<any, z.ZodTypeDef, any> extends T ? never : T extends ZodMetadata<infer U, infer M> ? M extends Satisfying ? M : extractMetadata<U, Satisfying> : T extends z.ZodOptional<infer U> ? extractMetadata<U, Satisfying> : T extends z.ZodNullable<infer U> ? extractMetadata<U, Satisfying> : T extends z.ZodDefault<infer U> ? extractMetadata<U, Satisfying> : T extends z.ZodLazy<infer U> ? extractMetadata<U, Satisfying> : T extends z.ZodEffects<infer U, any, any> ? extractMetadata<U, Satisfying> : T extends z.ZodCatch<infer U> ? extractMetadata<U, Satisfying> : T extends z.ZodBranded<infer U, any> ? extractMetadata<U, Satisfying> : T extends z.ZodPipeline<any, infer U> ? extractMetadata<U, Satisfying> : T extends z.ZodPromise<infer U> ? extractMetadata<U, Satisfying> : never;
export declare function extractMetadata<T extends z.ZodTypeAny, Satisfying extends object = object>(schema: T, satisfying?: Satisfying): extractMetadata<T, Satisfying>;
export type extractDeepMetadata<T extends z.ZodTypeAny, Satisfying extends object = object> = z.ZodType<any, z.ZodTypeDef, any> extends T ? never : T extends ZodMetadata<infer U, infer M> ? M extends Satisfying ? M : extractDeepMetadata<U, Satisfying> : T extends z.ZodOptional<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodNullable<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodDefault<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodLazy<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodEffects<infer U, any, any> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodCatch<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodBranded<infer U, any> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodPipeline<any, infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodPromise<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodArray<infer U> ? extractDeepMetadata<U, Satisfying> : T extends z.ZodSet<infer U> ? extractDeepMetadata<U, Satisfying> : never;
export declare function extractDeepMetadata<T extends z.ZodTypeAny, Satisfying extends object = object>(schema: T, satisfying?: Satisfying): extractDeepMetadata<T, Satisfying>;
declare module "zod" {
    interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
        /**
         * Marks this schema as includable via an `include[]` query param.
         * This should only be used on object or array of object property schemas.
         */
        includable(): IncludableZodType<this>;
    }
}
export declare const includableSymbol: unique symbol;
export type IncludableOutput<T> = (NonNullable<T> & {
    readonly [includableSymbol]: {
        value: T;
    };
}) | null | undefined;
export type IncludableInput<T> = T | null | undefined;
export type IncludableZodType<T extends z.ZodTypeAny> = ZodMetadata<z.ZodType<IncludableOutput<z.output<T>>, T["_def"], IncludableInput<z.input<T>>>, {
    stainless: {
        includable: true;
    };
}>;
export type isIncludable<T extends z.ZodTypeAny> = extractDeepMetadata<T, {
    stainless: {
        includable: true;
    };
}> extends {
    stainless: {
        includable: true;
    };
} ? true : false;
export declare function isIncludable<T extends z.ZodTypeAny>(schema: T): isIncludable<T>;
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
export type SelectableZodType<T extends z.ZodTypeAny> = z.ZodType<SelectableOutput<z.output<T>>, T["_def"], SelectableInput<z.input<T>>>;
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
export type StlTransformInput<Input> = z.ParseInput & {
    data: Input;
};
export type StlTransform<Input, Output> = (input: StlTransformInput<Input>, ctx: StlContext<any>) => Output | Promise<Output>;
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
export type StlPreprocess = (input: StlTransformInput<unknown>, ctx: StlContext<any>) => unknown;
export declare function stlPreprocess<I extends z.ZodTypeAny>(preprocess: StlPreprocess, schema: I): z.ZodEffects<I, I["_output"], unknown>;
export declare function path<T extends z.ZodRawShape>(shape: T, params?: z.RawCreateParams): z.ZodObject<T, "strip">;
export declare class StlParams<T extends z.ZodRawShape, UnknownKeys extends z.UnknownKeysParam = z.UnknownKeysParam, Catchall extends z.ZodTypeAny = z.ZodTypeAny, Output = z.objectOutputType<T, Catchall, UnknownKeys>, Input = z.objectInputType<T, Catchall, UnknownKeys>> extends z.ZodObject<T, UnknownKeys, Catchall, Output, Input> {
}
export declare function query<T extends z.ZodRawShape>(shape: T, params?: z.RawCreateParams): StlParams<T, "strip">;
export declare function body<T extends z.ZodRawShape>(shape: T, params?: z.RawCreateParams): StlParams<T, "strip">;
export declare function response<T extends z.ZodRawShape>(shape: T, params?: z.RawCreateParams): z.ZodObject<T, "strip">;
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
export declare function pageResponse<I extends z.ZodTypeAny>(item: I): ZodMetadata<ReturnType<PageResponseWrapper<I>["wrapped"]>, extractDeepMetadata<I> & {
    stainless: {
        pageResponse: true;
    };
}>;
export type isPageResponse<T extends z.ZodTypeAny> = extractMetadata<T, {
    stainless: {
        pageResponse: true;
    };
}> extends {
    stainless: {
        pageResponse: true;
    };
} ? true : false;
export declare function isPageResponse<T extends z.ZodTypeAny>(schema: T): isPageResponse<T>;
export type PageData<I> = {
    items: I[];
    startCursor: string | null;
    endCursor: string | null;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
};
export type PageItemType<D> = D extends PageData<any> ? D["items"][number] : never;
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