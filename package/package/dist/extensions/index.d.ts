import * as ReactQuery from "./react-query";
export type ExtensionConfig = {
    reactQuery: ReactQuery.Config;
};
export type GetExtensions<Extensions extends ExtensionConfig, Input, Output> = keyof Extensions extends "reactQuery" ? ReactQuery.MakeExtension<Input, Output> : never;
type Handler = (...args: any[]) => any;
export declare function getExtensionHandler(config: ExtensionConfig, action: string, queryFn: () => Promise<any>, queryKey: string[]): Handler | undefined;
export {};
//# sourceMappingURL=index.d.ts.map