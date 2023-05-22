import { AnyAPIDescription, AnyResourceConfig, allEndpoints } from "./stl";
import {
  OpenAPIRegistry,
  OpenAPIGenerator,
} from "@asteasolutions/zod-to-openapi";
import { snakeCase } from "lodash";
import { z } from "zod";
import { preprocessForZodToOpenApi } from "./preprocessForZodToOpenApi";
import { type OpenAPIObject } from "openapi3-ts";

function allModels(
  resource:
    | AnyResourceConfig
    | Pick<AnyResourceConfig, "models" | "namespacedResources">
): Record<string, z.ZodTypeAny> {
  return {
    ...resource.models,
    ...Object.assign(
      {},
      ...Object.keys(resource.namespacedResources || {}).map((k) =>
        allModels(resource.namespacedResources[k])
      )
    ),
  };
}

export function openapiSpec(apiDescription: AnyAPIDescription): OpenAPIObject {
  const registry = new OpenAPIRegistry();

  const models: Map<z.ZodTypeAny, string> = new Map(
    Object.entries(
      allModels({
        models: apiDescription.topLevel?.models,
        namespacedResources: apiDescription.resources,
      })
    ).map(([k, v]) => [v, k])
  );

  console.log([...models.values()]);

  for (const [model, name] of models.entries()) {
    registry.register(
      name,
      preprocessForZodToOpenApi({
        schema: model,
        models,
        processRootModel: true,
      })
    );
  }

  for (const route of allEndpoints({
    actions: apiDescription.topLevel?.actions,
    namespacedResources: apiDescription.resources,
  })) {
    const [httpMethod, path] = route.endpoint.split(" ", 2);
    const lowerMethod = httpMethod.toLowerCase() as "get" | "post" | "delete";
    registry.registerPath({
      method: lowerMethod,
      path: path,
      description: "TODO",
      summary: "TODO",
      request: {
        params: route.path
          ? (preprocessForZodToOpenApi({
              schema: route.path,
              models,
            }) as z.AnyZodObject)
          : undefined,
        query: route.query
          ? (preprocessForZodToOpenApi({
              schema: route.query,
              models,
            }) as z.AnyZodObject)
          : undefined,
        body: route.body
          ? {
              content: {
                "application/json": {
                  schema: preprocessForZodToOpenApi({
                    schema: route.body,
                    models,
                  }),
                },
              },
            }
          : undefined,
      },
      responses: {
        200: {
          description: "TODO",
          content: route.response
            ? {
                "application/json": {
                  schema: preprocessForZodToOpenApi({
                    schema: route.response,
                    models,
                  }),
                },
              }
            : undefined,
        },
      },
    });
  }

  const generator = new OpenAPIGenerator(registry.definitions, "3.0.0");

  const document = generator.generateDocument({
    info: {
      version: "1.0.0",
      title: "My API",
    },
    servers: [{ url: "v1" }],
  });

  const schemas = document.components?.schemas;
  if (schemas) {
    for (const name in models) {
      const schema = schemas[name];
      if (schema) (schema as any)["x-stainless-modelName"] = snakeCase(name);
    }
  }

  return document;
}
