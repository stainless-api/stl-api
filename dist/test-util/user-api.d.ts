import { z } from "stainless";
export declare const users: import("stainless").ResourceConfig<{
    update: import("stainless").Endpoint<import("stainless").EndpointConfig | undefined, "POST /api/users/{id}", z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, import("stainless").ZodObjectSchema | undefined, z.StlParams<{
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        accountType: z.ZodOptional<z.ZodNativeEnum<{
            admin: string;
            free: string;
            paid: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        email?: string | undefined;
        accountType?: string | undefined;
    }, {
        name?: string | undefined;
        email?: string | undefined;
        accountType?: string | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        siteWideRole: z.ZodEnum<["admin", "user"]>;
        accountType: z.ZodNativeEnum<{
            admin: string;
            free: string;
            paid: string;
        }>;
        githubUsername: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        accountType: string;
        siteWideRole: "admin" | "user";
        createAt: string;
        updatedAt: string;
        name?: string | null | undefined;
        email?: string | null | undefined;
        githubUsername?: string | null | undefined;
    }, {
        id: string;
        accountType: string;
        siteWideRole: "admin" | "user";
        createAt: string;
        updatedAt: string;
        name?: string | null | undefined;
        email?: string | null | undefined;
        githubUsername?: string | null | undefined;
    }>>;
}, Record<string, import("stainless").ResourceConfig<any, any, any>> | undefined, Record<string, z.ZodTypeAny> | undefined>;
//# sourceMappingURL=user-api.d.ts.map