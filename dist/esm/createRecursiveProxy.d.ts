export interface ProxyCallbackOptions {
    path: string[];
    args: unknown[];
}
export type ProxyCallback = (opts: ProxyCallbackOptions) => unknown;
export declare function createRecursiveProxy(callback: ProxyCallback, path: string[]): unknown;
//# sourceMappingURL=createRecursiveProxy.d.ts.map