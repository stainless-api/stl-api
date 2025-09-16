import * as z from "../z";
export declare const PrismaModelSymbol: unique symbol;
type MakePrismaModelMetadata<M> = {
    stainless: {
        prismaModel: M;
    };
};
interface PrismaHelpers {
    findUniqueOrThrow(args: any): Promise<any>;
}
export declare abstract class PrismaModel<O> extends z.Schema<O> {
    [PrismaModelSymbol]: true;
    abstract model: PrismaHelpers;
    metadata: MakePrismaModelMetadata<this["model"]>;
}
export declare const PrismaModelLoaderSymbol: unique symbol;
export declare abstract class PrismaModelLoader<O, I> extends z.Schema<O, I> {
    [PrismaModelLoaderSymbol]: true;
    abstract model: PrismaHelpers & {
        findUniqueOrThrow(args: any): Promise<O>;
    };
}
export declare function prismaModel<M>(model: M): {
    stainless: {
        prismaModel: M;
    };
};
export {};
//# sourceMappingURL=tTypesTest.d.ts.map