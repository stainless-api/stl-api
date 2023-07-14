import type { TypeSchemas } from "stainless";
export async function typeSchemas(): Promise<TypeSchemas> { return await import("./__endpointMap") as any; }
