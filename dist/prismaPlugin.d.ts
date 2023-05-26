import { MakeStainlessPlugin, z } from "stainless";
declare module "zod" {
    interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
        /**
         * Transforms the output value to fetch the Prisma model whose primary
         * key is the input value.  Throws if the primary key wasn't found.
         * This should only be used on path or body params; the Prisma model
         * is determined by the `prismaModel` passed to `stl.response` or
         * `z.pageResponse`.
         */
        prismaModelLoader<M extends PrismaModel>(prismaModel: M): z.ZodEffects<this, FindUniqueOrThrowResult<M>, z.input<this>>;
        prismaModel<M extends PrismaModel>(prismaModel: M): z.WithStlMetadata<this, {
            prismaModel: M;
        }>;
    }
}
declare module "stainless" {
    interface StlContext<EC extends AnyEndpoint> {
        prisma: z.ExtractStlMetadata<EC["response"]> extends {
            prismaModel: infer M extends PrismaModel;
        } ? PrismaContext<M> : unknown;
    }
}
export type PrismaContext<M extends PrismaModel> = {
    /**
     * The `prismaModel` passed to `stl.response` or
     * `z.pageResponse`.
     */
    prismaModel: M;
    /**
     * Injects query options from `expand`, `select`, and pagination
     * params into the given Prisma query options for the response
     * `prismaModel`.
     */
    wrapQuery: <Q extends {
        include?: any;
    }>(query: Q) => Q;
    /**
     * Shortcut for `findUnique` on the response `prismaModel` with
     * injected options from `expand`, `select`, and pagination params.
     */
    findUnique: FindUnique<M>;
    /**
     * Shortcut for `findUniqueOrThrow` on the response `prismaModel` with
     * injected options from `expand`, `select`, and pagination params.
     */
    findUniqueOrThrow: FindUniqueOrThrow<M>;
    /**
     * Shortcut for `findMany` on the response `prismaModel` with
     * injected options from `expand`, `select`, and pagination params.
     */
    findMany: FindMany<M>;
    /**
     * Shortcut for `create` on the response `prismaModel` with
     * injected options from `expand` and `select` params.
     */
    create: Create<M>;
    /**
     * Shortcut for `update` on the response `prismaModel` with
     * injected options from `expand` and `select` params.
     */
    update: Update<M>;
    /**
     * Shortcut for `delete` on the response `prismaModel` with
     * injected options from `expand` and `select` params.
     */
    delete: Delete<M>;
    /**
     * Fetches items from the database for the given Prisma query
     * options and `expand`, `select`, and pagination params, and
     * returns a page response.
     */
    paginate: (args: FindManyArgs<M>) => Promise<z.PageData<FindManyItem<M>>>;
};
export type PrismaStatics = {
    pagination: {
        wrapQuery: typeof wrapQuery;
        makeResponse: typeof makeResponse;
    };
    paginate: typeof paginate;
    expandToInclude: typeof expandToInclude;
};
declare function wrapQuery<Q>({ pageAfter, pageBefore, pageSize, sortBy, sortDirection, }: z.PaginationParams, query: Q): Q;
declare function makeResponse<I>(params: z.PaginationParams, items: I[]): z.PageData<I>;
interface PrismaModel {
    findUnique(args: any): Promise<any>;
    findUniqueOrThrow(args: any): Promise<any>;
    findMany(args: any): Promise<any>;
    create(args: any): Promise<any>;
    update(args: any): Promise<any>;
    delete(args: any): Promise<any>;
}
type FindUnique<D extends PrismaModel> = D extends {
    findUnique: infer Fn extends (args: any) => any;
} ? Fn : never;
type FindUniqueOrThrow<D extends PrismaModel> = D extends {
    findUniqueOrThrow: infer Fn extends (args: any) => any;
} ? Fn : never;
type FindUniqueOrThrowResult<D extends PrismaModel> = D extends {
    findUniqueOrThrow: (args: any) => Promise<infer Result>;
} ? Result : never;
type FindMany<D extends PrismaModel> = D extends {
    findMany: infer Fn extends (args: any) => any;
} ? Fn : never;
type Create<D extends PrismaModel> = D extends {
    create: infer Fn extends (args: any) => any;
} ? Fn : never;
type Update<D extends PrismaModel> = D extends {
    update: infer Fn extends (args: any) => any;
} ? Fn : never;
type Delete<D extends PrismaModel> = D extends {
    delete: infer Fn extends (args: any) => any;
} ? Fn : never;
type FindManyArgs<D extends PrismaModel> = D extends {
    findMany(args: infer Args): any;
} ? Args : never;
type FindManyItem<D extends PrismaModel> = D extends {
    findMany(args: any): Promise<Array<infer Item>>;
} ? Item : never;
declare function paginate<D extends PrismaModel>(delegate: D, { pageAfter, pageBefore, pageSize, sortBy, sortDirection, ...query }: FindManyArgs<D> & z.PaginationParams): Promise<z.PageData<FindManyItem<D>>>;
export declare const makePrismaPlugin: () => MakeStainlessPlugin<any, PrismaStatics>;
type TopLevel<E extends string> = E extends `${infer A}.${string}` ? A : E;
type NextLevel<E extends string, Prefix extends string> = E extends `${Prefix}.${infer B}` ? B : never;
type ExpandToInclude<T extends string> = {
    [K in TopLevel<T>]?: boolean | (NextLevel<T, K> extends string ? {
        include: ExpandToInclude<NextLevel<T, K>>;
    } : never);
};
declare function expandToInclude<T extends string[]>(expand: T): ExpandToInclude<T[number]>;
export {};
//# sourceMappingURL=prismaPlugin.d.ts.map