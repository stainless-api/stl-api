import { APIConfig, ClientConfig } from "../core/api-client-types";
export declare function generateOutput<API extends APIConfig>(api: API, config: ClientConfig<API["basePath"]>, installLocation?: string, reactQueryAlias?: string): Promise<string>;
//# sourceMappingURL=generate-types.d.ts.map