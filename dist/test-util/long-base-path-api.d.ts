import { z } from "stainless";
export declare const complicatedBasePath: "/api/camelCase/kebab-case/v2";
export declare const dogs: import("stainless").ResourceConfig<{
    list: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/camelCase/kebab-case/v2/dogs", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        color: string;
    }, {
        name: string;
        color: string;
    }>, "many">>;
}, Record<string, import("stainless").ResourceConfig<any, any, any>> | undefined, Record<string, z.ZodTypeAny> | undefined>;
//# sourceMappingURL=long-base-path-api.d.ts.map