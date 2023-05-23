import { z } from "./stl";

export function preprocessForZodToOpenApi<T extends z.ZodTypeAny>({
  schema,
  models,
  processRootModel = false,
  depthLimit = 1000,
}: {
  schema: z.ZodTypeAny;
  models: Map<z.ZodTypeAny, string>;
  processRootModel?: boolean;
  depthLimit?: number;
}): T {
  console.log("---------------------------");
  const path: string[] = [];
  let depth = 0;
  return recurse(schema) as T;
  function recurse(schema: z.ZodTypeAny): z.ZodTypeAny {
    const modelName = models.get(schema);
    console.log({ depth, name: schema.constructor.name, modelName, path });
    if (modelName && !processRootModel) {
      return schema.internal_openapi({ refId: modelName });
    }
    processRootModel = false;

    if (depth >= depthLimit) {
      throw new Error(
        `exceeded depth limit at ${path.join(
          "."
        )}; make one of these fields a model`
      );
    }
    try {
      depth++;

      if (schema instanceof z.ZodNullable) {
        return recurse(schema.unwrap()).nullable();
      }
      if (schema instanceof z.ZodOptional) {
        return recurse(schema.unwrap()).optional();
      }
      if (schema instanceof z.ZodDefault) {
        return recurse(schema._def.innerType).default(schema._def.defaultValue);
      }
      if (schema instanceof z.ZodEffects) {
        return z.effect(recurse(schema._def.schema), schema._def.effect);
      }
      if (schema instanceof z.ZodPipeline) {
        return recurse(schema._def.in).pipe(recurse(schema._def.out));
      }
      if (schema instanceof z.ZodLazy) {
        return recurse(schema.schema);
      }
      if (schema instanceof z.ZodArray) {
        return z.array(recurse(schema.element));
      }
      if (schema instanceof z.ZodTuple) {
        return z.tuple(schema.items.map(recurse));
      }
      if (schema instanceof z.ZodObject) {
        return z.object(
          Object.fromEntries(
            Object.keys(schema.shape).map((key) => {
              path.push(key);
              try {
                return [key, recurse(schema.shape[key])];
              } finally {
                path.pop();
              }
            })
          )
        );
      }
      if (schema instanceof z.ZodRecord) {
        return z.record(recurse(schema.keySchema), recurse(schema.valueSchema));
      }
      if (schema instanceof z.ZodUnion) {
        return z.union(schema.options.map(recurse));
      }
      if (schema instanceof z.ZodIntersection) {
        return z.intersection(
          recurse(schema._def.left),
          recurse(schema._def.right)
        );
      }
      if (schema instanceof z.ZodDiscriminatedUnion) {
        return z.discriminatedUnion(
          schema._def.discriminator,
          schema.options.map(recurse)
        );
      }

      return schema;
    } finally {
      depth--;
    }
  }
}
