import { z } from "stainless";
export declare const cats: import("stainless").ResourceConfig<{
    list: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        color: string;
    }, {
        name: string;
        color: string;
    }>, "many">>;
    create: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "POST /api/cats", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.StlParams<{
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        color: string;
    }, {
        name: string;
        color: string;
    }>, z.ZodObject<{
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        color: string;
    }, {
        name: string;
        color: string;
    }>>;
    update: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "PATCH /api/cats/{catName}", z.ZodObject<{
        catName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        catName: string;
    }, {
        catName: string;
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
        name: string;
        color: string;
    }, {
        name: string;
        color: string;
    }>>;
    retrieve: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats/{catName}", z.ZodObject<{
        catName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        catName: string;
    }, {
        catName: string;
    }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodObject<{
        name: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        color: string;
    }, {
        name: string;
        color: string;
    }>>;
    retrieveLitter: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats/{catName}/litter", z.ZodObject<{
        catName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        catName: string;
    }, {
        catName: string;
    }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodArray<z.ZodObject<{
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
export declare const catApi: import("stainless").APIDescription<"/api", {
    actions: {
        getOpenapi: import("stainless").OpenAPIEndpoint;
    };
} & import("stainless").ResourceConfig<{}, undefined, undefined>, {
    cats: import("stainless").ResourceConfig<{
        list: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            color: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>, "many">>;
        create: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "POST /api/cats", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.StlParams<{
            name: z.ZodString;
            color: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>, z.ZodObject<{
            name: z.ZodString;
            color: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>>;
        update: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "PATCH /api/cats/{catName}", z.ZodObject<{
            catName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            catName: string;
        }, {
            catName: string;
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
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>>;
        retrieve: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats/{catName}", z.ZodObject<{
            catName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            catName: string;
        }, {
            catName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodObject<{
            name: z.ZodString;
            color: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>>;
        retrieveLitter: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats/{catName}/litter", z.ZodObject<{
            catName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            catName: string;
        }, {
            catName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodArray<z.ZodObject<{
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
}>;
//# sourceMappingURL=cat-api.d.ts.map