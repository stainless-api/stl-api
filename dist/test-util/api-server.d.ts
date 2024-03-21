export declare function mockFetchImplementation(input: string | URL | Request, options?: RequestInit): Promise<Response>;
export declare const api: import("stainless").APIDescription<"/api", {
    actions: {
        getOpenapi: import("stainless").OpenAPIEndpoint;
    };
} & import("stainless").ResourceConfig<{}, undefined, undefined>, {
    cats: import("stainless").ResourceConfig<{
        list: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodArray<import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>, "many">>;
        create: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "POST /api/cats", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("stainless/dist/z").StlParams<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>, import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>>;
        update: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "PATCH /api/cats/{catName}", import("zod").ZodObject<{
            catName: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            catName: string;
        }, {
            catName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("zod").ZodObject<{
            name: import("zod").ZodOptional<import("zod").ZodString>;
            color: import("zod").ZodOptional<import("zod").ZodString>;
        }, "strip", import("zod").ZodTypeAny, {
            name?: string | undefined;
            color?: string | undefined;
        }, {
            name?: string | undefined;
            color?: string | undefined;
        }>, import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>>;
        retrieve: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats/{catName}", import("zod").ZodObject<{
            catName: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            catName: string;
        }, {
            catName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>>;
        retrieveLitter: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats/{catName}/litter", import("zod").ZodObject<{
            catName: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            catName: string;
        }, {
            catName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodArray<import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>, "many">>;
    }, Record<string, import("stainless").ResourceConfig<any, any, any>> | undefined, Record<string, import("zod").ZodTypeAny> | undefined>;
    dogs: import("stainless").ResourceConfig<{
        list: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodArray<import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>, "many">>;
        create: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "POST /api/dogs", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("stainless/dist/z").StlParams<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>, import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>>;
        retrieve: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs/{dogName}", import("zod").ZodObject<{
            dogName: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            dogName: string;
        }, {
            dogName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>>;
        update: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "PATCH /api/dogs/{dogName}", import("zod").ZodObject<{
            dogName: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            dogName: string;
        }, {
            dogName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("zod").ZodObject<{
            name: import("zod").ZodOptional<import("zod").ZodString>;
            color: import("zod").ZodOptional<import("zod").ZodString>;
        }, "strip", import("zod").ZodTypeAny, {
            name?: string | undefined;
            color?: string | undefined;
        }, {
            name?: string | undefined;
            color?: string | undefined;
        }>, import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>>;
        retrieveLitter: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs/{dogName}/litter", import("zod").ZodObject<{
            dogName: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            dogName: string;
        }, {
            dogName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodArray<import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>, "many">>;
    }, Record<string, import("stainless").ResourceConfig<any, any, any>> | undefined, Record<string, import("zod").ZodTypeAny> | undefined>;
    dogTreats: import("stainless").ResourceConfig<{
        list: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs/{dogName}/dog-treats", import("zod").ZodObject<{
            dogName: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            dogName: string;
        }, {
            dogName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodArray<import("zod").ZodObject<{
            yummy: import("zod").ZodBoolean;
        }, "strip", import("zod").ZodTypeAny, {
            yummy: boolean;
        }, {
            yummy: boolean;
        }>, "many">>;
        retrieveTreat: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs/{dogName}/dog-treats/{treatId}", import("zod").ZodObject<{
            dogName: import("zod").ZodString;
            treatId: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            dogName: string;
            treatId: string;
        }, {
            dogName: string;
            treatId: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodObject<{
            yummy: import("zod").ZodBoolean;
        }, "strip", import("zod").ZodTypeAny, {
            yummy: boolean;
        }, {
            yummy: boolean;
        }>>;
        update: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "PATCH /api/dogs/{dogName}/dog-treats/{treatId}", import("zod").ZodObject<{
            dogName: import("zod").ZodString;
            treatId: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            dogName: string;
            treatId: string;
        }, {
            dogName: string;
            treatId: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("stainless/dist/z").StlParams<{
            yummy: import("zod").ZodBoolean;
        }, "strip", import("zod").ZodTypeAny, {
            yummy: boolean;
        }, {
            yummy: boolean;
        }>, import("zod").ZodObject<{
            yummy: import("zod").ZodBoolean;
        }, "strip", import("zod").ZodTypeAny, {
            yummy: boolean;
        }, {
            yummy: boolean;
        }>>;
    }, Record<string, import("stainless").ResourceConfig<any, any, any>> | undefined, Record<string, import("zod").ZodTypeAny> | undefined>;
}>;
export declare const nestedApi: import("stainless").APIDescription<"/api", {
    actions: {
        getOpenapi: import("stainless").OpenAPIEndpoint;
    };
} & import("stainless").ResourceConfig<{}, undefined, undefined>, {
    cats: import("stainless").ResourceConfig<{
        list: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodArray<import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>, "many">>;
        create: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "POST /api/cats", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("stainless/dist/z").StlParams<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>, import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>>;
        update: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "PATCH /api/cats/{catName}", import("zod").ZodObject<{
            catName: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            catName: string;
        }, {
            catName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("zod").ZodObject<{
            name: import("zod").ZodOptional<import("zod").ZodString>;
            color: import("zod").ZodOptional<import("zod").ZodString>;
        }, "strip", import("zod").ZodTypeAny, {
            name?: string | undefined;
            color?: string | undefined;
        }, {
            name?: string | undefined;
            color?: string | undefined;
        }>, import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>>;
        retrieve: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats/{catName}", import("zod").ZodObject<{
            catName: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            catName: string;
        }, {
            catName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>>;
        retrieveLitter: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/cats/{catName}/litter", import("zod").ZodObject<{
            catName: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            catName: string;
        }, {
            catName: string;
        }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodArray<import("zod").ZodObject<{
            name: import("zod").ZodString;
            color: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            name: string;
            color: string;
        }, {
            name: string;
            color: string;
        }>, "many">>;
    }, Record<string, import("stainless").ResourceConfig<any, any, any>> | undefined, Record<string, import("zod").ZodTypeAny> | undefined>;
    dogs: {
        namespacedResources: {
            dogTreats: import("stainless").ResourceConfig<{
                list: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs/{dogName}/dog-treats", import("zod").ZodObject<{
                    dogName: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    dogName: string;
                }, {
                    dogName: string;
                }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodArray<import("zod").ZodObject<{
                    yummy: import("zod").ZodBoolean;
                }, "strip", import("zod").ZodTypeAny, {
                    yummy: boolean;
                }, {
                    yummy: boolean;
                }>, "many">>;
                retrieveTreat: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs/{dogName}/dog-treats/{treatId}", import("zod").ZodObject<{
                    dogName: import("zod").ZodString;
                    treatId: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    dogName: string;
                    treatId: string;
                }, {
                    dogName: string;
                    treatId: string;
                }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodObject<{
                    yummy: import("zod").ZodBoolean;
                }, "strip", import("zod").ZodTypeAny, {
                    yummy: boolean;
                }, {
                    yummy: boolean;
                }>>;
                update: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "PATCH /api/dogs/{dogName}/dog-treats/{treatId}", import("zod").ZodObject<{
                    dogName: import("zod").ZodString;
                    treatId: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    dogName: string;
                    treatId: string;
                }, {
                    dogName: string;
                    treatId: string;
                }>, import("stainless").ZodObjectSchema | undefined, import("stainless/dist/z").StlParams<{
                    yummy: import("zod").ZodBoolean;
                }, "strip", import("zod").ZodTypeAny, {
                    yummy: boolean;
                }, {
                    yummy: boolean;
                }>, import("zod").ZodObject<{
                    yummy: import("zod").ZodBoolean;
                }, "strip", import("zod").ZodTypeAny, {
                    yummy: boolean;
                }, {
                    yummy: boolean;
                }>>;
            }, Record<string, import("stainless").ResourceConfig<any, any, any>> | undefined, Record<string, import("zod").ZodTypeAny> | undefined>;
        };
        summary: string;
        internal?: boolean | undefined;
        actions: {
            list: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodArray<import("zod").ZodObject<{
                name: import("zod").ZodString;
                color: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                name: string;
                color: string;
            }, {
                name: string;
                color: string;
            }>, "many">>;
            create: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "POST /api/dogs", import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("stainless/dist/z").StlParams<{
                name: import("zod").ZodString;
                color: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                name: string;
                color: string;
            }, {
                name: string;
                color: string;
            }>, import("zod").ZodObject<{
                name: import("zod").ZodString;
                color: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                name: string;
                color: string;
            }, {
                name: string;
                color: string;
            }>>;
            retrieve: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs/{dogName}", import("zod").ZodObject<{
                dogName: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                dogName: string;
            }, {
                dogName: string;
            }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodObject<{
                name: import("zod").ZodString;
                color: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                name: string;
                color: string;
            }, {
                name: string;
                color: string;
            }>>;
            update: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "PATCH /api/dogs/{dogName}", import("zod").ZodObject<{
                dogName: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                dogName: string;
            }, {
                dogName: string;
            }>, import("stainless").ZodObjectSchema | undefined, import("zod").ZodObject<{
                name: import("zod").ZodOptional<import("zod").ZodString>;
                color: import("zod").ZodOptional<import("zod").ZodString>;
            }, "strip", import("zod").ZodTypeAny, {
                name?: string | undefined;
                color?: string | undefined;
            }, {
                name?: string | undefined;
                color?: string | undefined;
            }>, import("zod").ZodObject<{
                name: import("zod").ZodString;
                color: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                name: string;
                color: string;
            }, {
                name: string;
                color: string;
            }>>;
            retrieveLitter: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "GET /api/dogs/{dogName}/litter", import("zod").ZodObject<{
                dogName: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                dogName: string;
            }, {
                dogName: string;
            }>, import("stainless").ZodObjectSchema | undefined, import("stainless").ZodObjectSchema | undefined, import("zod").ZodArray<import("zod").ZodObject<{
                name: import("zod").ZodString;
                color: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                name: string;
                color: string;
            }, {
                name: string;
                color: string;
            }>, "many">>;
        };
        models: Record<string, import("zod").ZodTypeAny> | undefined;
    };
}>;
export type API = typeof api;
export declare const config: {
    readonly basePath: "/api";
};
export type Config = typeof config;
//# sourceMappingURL=api-server.d.ts.map