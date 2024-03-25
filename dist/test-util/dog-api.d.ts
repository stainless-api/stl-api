import { z } from "stainless";
export declare const dogs: import("stainless").ResourceConfig<{
    list: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        color: string;
        name: string;
    }, {
        color: string;
        name: string;
    }>, "many">>;
    create: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "POST /api/dogs", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.StlParams<{
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        color: string;
        name: string;
    }, {
        color: string;
        name: string;
    }>, z.ZodObject<{
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        color: string;
        name: string;
    }, {
        color: string;
        name: string;
    }>>;
    retrieve: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs/{dogName}", z.ZodObject<{
        dogName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        dogName: string;
    }, {
        dogName: string;
    }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodObject<{
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        color: string;
        name: string;
    }, {
        color: string;
        name: string;
    }>>;
    update: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "PATCH /api/dogs/{dogName}", z.ZodObject<{
        dogName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        dogName: string;
    }, {
        dogName: string;
    }>, import("stainless").ZodObjectSchema | undefined, z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        color?: string | undefined;
    }, {
        name?: string | undefined;
        color?: string | undefined;
    }>, z.ZodObject<{
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        color: string;
        name: string;
    }, {
        color: string;
        name: string;
    }>>;
    retrieveLitter: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs/{dogName}/litter", z.ZodObject<{
        dogName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        dogName: string;
    }, {
        dogName: string;
    }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        color: string;
        name: string;
    }, {
        color: string;
        name: string;
    }>, "many">>;
}, Record<string, import("stainless").ResourceConfig<any, any, any>> | undefined, Record<string, z.ZodTypeAny> | undefined>;
//# sourceMappingURL=dog-api.d.ts.map