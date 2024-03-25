import { z } from "stainless";
declare const colorEnum: {
    red: string;
    blue: string;
    black: string;
    white: string;
};
export type Color = keyof typeof colorEnum;
export declare const cats: import("stainless").ResourceConfig<{
    list: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats", import("stainless").ZodObjectSchema | undefined, z.ZodObject<{
        color: z.ZodNativeEnum<{
            red: string;
            blue: string;
            black: string;
            white: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        color: string;
    }, {
        color: string;
    }>, import("stainless").ZodObjectSchema | undefined, z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        color: z.ZodNativeEnum<{
            red: string;
            blue: string;
            black: string;
            white: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        color: string;
        name: string;
    }, {
        color: string;
        name: string;
    }>, "many">>;
    create: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "POST /api/cats", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.StlParams<{
        name: z.ZodString;
        color: z.ZodNativeEnum<{
            red: string;
            blue: string;
            black: string;
            white: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        color: string;
        name: string;
    }, {
        color: string;
        name: string;
    }>, z.ZodObject<{
        name: z.ZodString;
        color: z.ZodNativeEnum<{
            red: string;
            blue: string;
            black: string;
            white: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        color: string;
        name: string;
    }, {
        color: string;
        name: string;
    }>>;
    update: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "PATCH /api/cats/{catName}", z.ZodObject<{
        catName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        catName: string;
    }, {
        catName: string;
    }>, import("stainless").ZodObjectSchema | undefined, z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodNativeEnum<{
            red: string;
            blue: string;
            black: string;
            white: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        color?: string | undefined;
    }, {
        name?: string | undefined;
        color?: string | undefined;
    }>, z.ZodObject<{
        name: z.ZodString;
        color: z.ZodNativeEnum<{
            red: string;
            blue: string;
            black: string;
            white: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        color: string;
        name: string;
    }, {
        color: string;
        name: string;
    }>>;
    retrieve: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats/{catName}", z.ZodObject<{
        catName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        catName: string;
    }, {
        catName: string;
    }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodObject<{
        name: z.ZodString;
        color: z.ZodNativeEnum<{
            red: string;
            blue: string;
            black: string;
            white: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        color: string;
        name: string;
    }, {
        color: string;
        name: string;
    }>>;
    retrieveLitter: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats/{catName}/litter", z.ZodObject<{
        catName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        catName: string;
    }, {
        catName: string;
    }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        color: z.ZodNativeEnum<{
            red: string;
            blue: string;
            black: string;
            white: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        color: string;
        name: string;
    }, {
        color: string;
        name: string;
    }>, "many">>;
}, Record<string, import("stainless").ResourceConfig<any, any, any>> | undefined, Record<string, z.ZodTypeAny> | undefined>;
export declare const catApi: import("stainless").APIDescription<"/api", {
    actions: {
        getOpenapi: import("stainless").OpenAPIEndpoint;
    };
} & import("stainless").ResourceConfig<{}, undefined, undefined>, {
    cats: import("stainless").ResourceConfig<{
        list: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats", import("stainless").ZodObjectSchema | undefined, z.ZodObject<{
            color: z.ZodNativeEnum<{
                red: string;
                blue: string;
                black: string;
                white: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            color: string;
        }, {
            color: string;
        }>, import("stainless").ZodObjectSchema | undefined, z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            color: z.ZodNativeEnum<{
                red: string;
                blue: string;
                black: string;
                white: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            color: string;
            name: string;
        }, {
            color: string;
            name: string;
        }>, "many">>;
        create: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "POST /api/cats", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.StlParams<{
            name: z.ZodString;
            color: z.ZodNativeEnum<{
                red: string;
                blue: string;
                black: string;
                white: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            color: string;
            name: string;
        }, {
            color: string;
            name: string;
        }>, z.ZodObject<{
            name: z.ZodString;
            color: z.ZodNativeEnum<{
                red: string;
                blue: string;
                black: string;
                white: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            color: string;
            name: string;
        }, {
            color: string;
            name: string;
        }>>;
        update: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "PATCH /api/cats/{catName}", z.ZodObject<{
            catName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            catName: string;
        }, {
            catName: string;
        }>, import("stainless").ZodObjectSchema | undefined, z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodNativeEnum<{
                red: string;
                blue: string;
                black: string;
                white: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            color?: string | undefined;
        }, {
            name?: string | undefined;
            color?: string | undefined;
        }>, z.ZodObject<{
            name: z.ZodString;
            color: z.ZodNativeEnum<{
                red: string;
                blue: string;
                black: string;
                white: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            color: string;
            name: string;
        }, {
            color: string;
            name: string;
        }>>;
        retrieve: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats/{catName}", z.ZodObject<{
            catName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            catName: string;
        }, {
            catName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodObject<{
            name: z.ZodString;
            color: z.ZodNativeEnum<{
                red: string;
                blue: string;
                black: string;
                white: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            color: string;
            name: string;
        }, {
            color: string;
            name: string;
        }>>;
        retrieveLitter: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats/{catName}/litter", z.ZodObject<{
            catName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            catName: string;
        }, {
            catName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            color: z.ZodNativeEnum<{
                red: string;
                blue: string;
                black: string;
                white: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            color: string;
            name: string;
        }, {
            color: string;
            name: string;
        }>, "many">>;
    }, Record<string, import("stainless").ResourceConfig<any, any, any>> | undefined, Record<string, z.ZodTypeAny> | undefined>;
}>;
export {};
//# sourceMappingURL=cat-api.d.ts.map