import { z, AnyAPIDescription, AnyResourceConfig, allEndpoints } from "./stl";
import {
  ZodOpenApiOperationObject,
  ZodOpenApiPathsObject,
  createDocument,
} from "zod-openapi";
import type { OpenAPIObject } from "zod-openapi/lib-types/openapi3-ts/dist/oas31";
import { snakeCase } from "lodash";

function allModels(
  resource:
    | AnyResourceConfig
    | Pick<AnyResourceConfig, "models" | "namespacedResources">,
): Record<string, z.ZodTypeAny> {
  return {
    ...resource.models,
    ...Object.assign(
      {},
      ...Object.keys(resource.namespacedResources || {}).map((k) =>
        allModels(resource.namespacedResources[k]),
      ),
    ),
  };
}

export async function openapiSpec(
  apiDescription: AnyAPIDescription,
): Promise<OpenAPIObject> {
  const models = allModels({
    models: apiDescription.topLevel?.models,
    namespacedResources: apiDescription.resources,
  });
  for (const name in models) {
    (models[name] as any)["x-stainless-modelName"] = snakeCase(name);
  }

  const endpoints = allEndpoints({
    actions: apiDescription.topLevel?.actions,
    namespacedResources: apiDescription.resources,
  });

  await Promise.all(endpoints.map((e) => e.stl.loadEndpointTypeSchemas(e)));

  const paths: ZodOpenApiPathsObject = {};
  for (const route of endpoints) {
    const [httpMethod, path] = route.endpoint.split(" ", 2);
    const lowerMethod = httpMethod.toLowerCase() as "get" | "post" | "delete";
    const operation: ZodOpenApiOperationObject = {
      summary: "TODO",
      description: "TODO",
      requestParams: {
        path: route.path,
        query: route.query,
        // TODO
        // header: route.header,
      },
      requestBody: {
        content: {
          "application/json": {
            schema: route.body,
          },
        },
      },
      responses: {
        200: {
          description: "success",
          content: route.response
            ? {
                "application/json": {
                  schema: route.response,
                },
              }
            : {},
        },
      },
    };

    paths[path] ??= {};
    paths[path][lowerMethod] = operation;
  }

  const document = createDocument({
    openapi: "3.1.0",
    info: {
      version: "1.0.0",
      title: "My API",
    },
    servers: [{ url: "v1" }],
    components: {
      schemas: models,
    },
    paths,
  });
  return document;
}
