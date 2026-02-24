import { MakeStainlessPlugin, StlContext, z } from "stainless";
declare module "zod" {
    interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
        /**
         * Transforms the output value to fetch the Prisma model whose primary
         * key is the input value.  Throws if the primary key wasn't found.
         * This should only be used on path or body params; the Prisma model
         * is determined by the `prismaModel` passed to `stl.response` or
         * `z.pageResponse`.
         */
        prismaModelLoader<M extends PrismaHelpers>(prismaModel: M | (() => M)): z.ZodEffects<this, FindUniqueOrThrowResult<M>, z.input<this>>;
        prismaModel<M extends PrismaHelpers>(prismaModel: M | (() => M)): z.ZodMetadata<this, {
            stainless: {
                prismaModel: () => M;
            };
        }>;
    }
}
export type extractPrismaModel<T extends z.ZodTypeAny> = z.extractDeepMetadata<T, {
    stainless: {
        prismaModel: () => PrismaHelpers;
    };
}> extends {
    stainless: {
        prismaModel: () => infer P extends PrismaHelpers;
    };
} ? P : never;
export declare function extractPrismaModel<T extends z.ZodTypeAny>(schema: T): extractPrismaModel<T>;
declare module "stainless" {
    interface StlContext<EC extends AnyBaseEndpoint> {
        prisma: extractPrismaModel<EC["response"]> extends infer M extends PrismaHelpers ? PrismaContext<M> : unknown;
    }
}
export type PrismaContext<M extends PrismaHelpers> = {
    /**
     * The `prismaModel` passed to `stl.response` or
     * `z.pageResponse`.
     */
    prismaModel: M;
    /**
     * Injects query options from `include`, `select`, and pagination
     * params into the given Prisma query options for the response
     * `prismaModel`.
     */
    wrapQuery: <Q extends {
        include?: any;
    }>(query: Q) => Q;
    /**
     * Shortcut for `findUnique` on the response `prismaModel` with
     * injected options from `include`, `select`, and pagination params.
     */
    findUnique: FindUnique<M>;
    /**
     * Shortcut for `findUniqueOrThrow` on the response `prismaModel` with
     * injected options from `include`, `select`, and pagination params.
     */
    findUniqueOrThrow: FindUniqueOrThrow<M>;
    /**
     * Shortcut for `findMany` on the response `prismaModel` with
     * injected options from `include`, `select`, and pagination params.
     */
    findMany: FindMany<M>;
    /**
     * Shortcut for `create` on the response `prismaModel` with
     * injected options from `include` and `select` params.
     */
    create: Create<M>;
    /**
     * Shortcut for `update` on the response `prismaModel` with
     * injected options from `include` and `select` params.
     */
    update: Update<M>;
    /**
     * Shortcut for `delete` on the response `prismaModel` with
     * injected options from `include` and `select` params.
     */
    delete: Delete<M>;
    /**
     * Fetches items from the database for the given Prisma query
     * options and `include`, `select`, and pagination params, and
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
};
declare function wrapQuery<Q>({ pageAfter, pageBefore, pageSize, sortBy, sortDirection, }: z.PaginationParams, query: Q): Q;
declare function makeResponse<I>(params: z.PaginationParams, items: I[]): z.PageData<I>;
interface PrismaHelpers {
    findUnique(args: any): Promise<any>;
    findUniqueOrThrow(args: any): Promise<any>;
    findMany(args: any): Promise<any>;
    create(args: any): Promise<any>;
    update(args: any): Promise<any>;
    delete(args: any): Promise<any>;
}
type FindUnique<D extends PrismaHelpers> = D extends {
    findUnique: infer Fn extends (args: any) => any;
} ? Fn : never;
type FindUniqueOrThrow<D extends PrismaHelpers> = D extends {
    findUniqueOrThrow: infer Fn extends (args: any) => any;
} ? Fn : never;
type FindUniqueOrThrowResult<D extends PrismaHelpers> = D extends {
    findUniqueOrThrow: (args: any) => Promise<infer Result>;
} ? Result : never;
type FindMany<D extends PrismaHelpers> = D extends {
    findMany: infer Fn extends (args: any) => any;
} ? Fn : never;
type Create<D extends PrismaHelpers> = D extends {
    create: infer Fn extends (args: any) => any;
} ? Fn : never;
type Update<D extends PrismaHelpers> = D extends {
    update: infer Fn extends (args: any) => any;
} ? Fn : never;
type Delete<D extends PrismaHelpers> = D extends {
    delete: infer Fn extends (args: any) => any;
} ? Fn : never;
type FindManyArgs<D extends PrismaHelpers> = D extends {
    findMany(args: infer Args): any;
} ? Args : never;
type FindManyItem<D extends PrismaHelpers> = D extends {
    findMany(args: any): Promise<Array<infer Item>>;
} ? Item : never;
declare function paginate<D extends PrismaHelpers>(delegate: D, { pageAfter, pageBefore, pageSize, sortBy, sortDirection, ...query }: FindManyArgs<D> & z.PaginationParams): Promise<z.PageData<FindManyItem<D>>>;
export declare const makePrismaPlugin: () => MakeStainlessPlugin<PrismaStatics>;
export declare const PrismaModelSymbol: unique symbol;
type MakePrismaModelMetadata<M> = {
    stainless: {
        prismaModel: () => M;
    };
};
export declare abstract class PrismaModel<O> extends z.Schema<O> {
    [PrismaModelSymbol]: true;
    abstract model: PrismaHelpers;
    metadata: MakePrismaModelMetadata<this["model"]>;
}
export declare const PrismaModelLoaderSymbol: unique symbol;
export declare abstract class PrismaModelLoader<O, I> extends z.Schema<O, I> {
    [PrismaModelLoaderSymbol]: true;
    [z.EffectsSymbol]: true;
    abstract model: {
        findUniqueOrThrow(args: any): Promise<O>;
    } | (() => {
        findUniqueOrThrow(args: any): Promise<O>;
    });
    transform(id: z.Out<I>, ctx: StlContext<any>): Promise<z.Out<O>>;
}
export {};
//# sourceMappingURL=prismaPlugin.d.ts.map