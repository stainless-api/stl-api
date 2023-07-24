import * as t from "../t";
export declare const PrismaModelSymbol: unique symbol;
type MakePrismaModelMetadata<M> = {
    stainless: {
        prismaModel: M;
    };
};
interface PrismaHelpers {
    findUniqueOrThrow(args: any): Promise<any>;
}
export declare abstract class PrismaModel extends t.EffectlessSchema {
    [PrismaModelSymbol]: true;
    abstract model: PrismaHelpers;
    metadata: MakePrismaModelMetadata<this["model"]>;
}
export declare const PrismaModelLoaderSymbol: unique symbol;
type FindUniqueOrThrowResult<D extends PrismaHelpers> = D extends {
    findUniqueOrThrow: (args: any) => Promise<infer Result>;
} ? Result : never;
export declare abstract class PrismaModelLoader extends t.Effects {
    [PrismaModelLoaderSymbol]: true;
    output: FindUniqueOrThrowResult<this["model"]>;
    abstract model: PrismaHelpers;
}
type PathString = `/${string}`;
export declare class PathStringSchema<I extends string = string> extends t.Refine {
    input: I;
    refine(value: string): value is PathString;
}
export declare function prismaModel<M>(model: M): {
    stainless: {
        prismaModel: M;
    };
};
export {};
//# sourceMappingURL=tTypesTest.d.ts.map