import { z } from "stainless";
export declare const dogTreats: import("stainless").ResourceConfig<{
    get: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs/{dogName}/dog-treats", z.ZodObject<{
        dogName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        dogName: string;
    }, {
        dogName: string;
    }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodObject<{
        yummy: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        yummy: boolean;
    }, {
        yummy: boolean;
    }>>;
}, Record<string, import("stainless").ResourceConfig<any, any, any>> | undefined, Record<string, z.ZodTypeAny> | undefined>;
//# sourceMappingURL=dog-treat-api.d.ts.map