import * as tm from "ts-morph";
export type NodeType = [tm.Node, tm.Type];
export interface EndpointTypeInstance {
    endpointPath: string;
    callExpression: tm.Node;
    query?: NodeType;
    path?: NodeType;
    body?: NodeType;
    response?: NodeType;
}
export declare function preprocessEndpoint(callExpression: tm.CallExpression): EndpointTypeInstance | undefined;
//# sourceMappingURL=endpointPreprocess.d.ts.map