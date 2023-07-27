import * as z from "./z";

export default function coerceParams<T extends z.ZodTypeAny>(schema: T): T {
  if (schema instanceof z.ZodNumber) {
    return new z.ZodNumber({ ...schema._def, coerce: true }) as any;
  }
  if (schema instanceof z.ZodString) {
    return new z.ZodString({ ...schema._def, coerce: true }) as any;
  }
  if (schema instanceof z.ZodBoolean) {
    return new z.ZodBoolean({ ...schema._def, coerce: true }) as any;
  }
  if (schema instanceof z.ZodDate) {
    return new z.ZodDate({ ...schema._def, coerce: true }) as any;
  }
  if (schema instanceof z.ZodMetadata) {
    return coerceParams(
      (schema as z.ZodMetadata<z.ZodTypeAny, any>).innerType()
    ).withMetadata(schema.metadata) as any;
  }
  if (schema instanceof z.ZodArray) {
    return coerceParams(
      (schema as z.ZodArray<z.ZodTypeAny>).element
    ).array() as any;
  }
  if (schema instanceof z.ZodLazy) {
    return coerceParams((schema as z.ZodLazy<z.ZodTypeAny>).schema) as any;
  }
  if (schema instanceof z.ZodObject) {
    return new z.ZodObject({
      ...schema._def,
      shape: () =>
        Object.fromEntries(
          Object.entries(schema.shape).map(([key, child]) => [
            key,
            coerceParams(child as z.ZodTypeAny),
          ])
        ),
      catchall: coerceParams(schema._def.catchall),
    }) as any;
  }
  if (schema instanceof z.ZodPromise) {
    return coerceParams((schema as z.ZodPromise<z.ZodTypeAny>).unwrap()) as any;
  }
  if (schema instanceof z.ZodCatch) {
    return new z.ZodCatch({
      ...schema._def,
      innerType: coerceParams(schema._def.innerType),
    }) as any;
  }
  if (schema instanceof z.ZodBranded) {
    return coerceParams(
      (schema as z.ZodBranded<z.ZodTypeAny, any>).unwrap()
    ) as any;
  }
  if (schema instanceof z.ZodSet) {
    return z.set(
      coerceParams((schema as z.ZodSet<z.ZodTypeAny>)._def.valueType)
    ) as any;
  }
  if (schema instanceof z.ZodDefault) {
    return coerceParams(
      (schema as z.ZodDefault<z.ZodTypeAny>).removeDefault()
    ).default(schema._def.defaultValue()) as any;
  }
  if (schema instanceof z.ZodEffects) {
    return z.effect(
      coerceParams((schema as z.ZodEffects<z.ZodTypeAny>).innerType()),
      schema._def.effect
    ) as any;
  }
  if (schema instanceof z.ZodPipeline) {
    return coerceParams(
      (schema as z.ZodPipeline<z.ZodTypeAny, z.ZodTypeAny>)._def.in
    ).pipe(
      coerceParams(
        (schema as z.ZodPipeline<z.ZodTypeAny, z.ZodTypeAny>)._def.out
      )
    ) as any;
  }
  if (schema instanceof z.ZodMap) {
    return z.map(
      coerceParams(
        (schema as z.ZodMap<z.ZodTypeAny, z.ZodTypeAny>)._def.keyType
      ),
      coerceParams(
        (schema as z.ZodMap<z.ZodTypeAny, z.ZodTypeAny>)._def.valueType
      )
    ) as any;
  }
  if (schema instanceof z.ZodDiscriminatedUnion) {
    return z.discriminatedUnion(
      schema.discriminator,
      schema.options.map(coerceParams)
    ) as any;
  }
  if (schema instanceof z.ZodUnion) {
    return z.union(schema.options.map(coerceParams)) as any;
  }
  if (schema instanceof z.ZodIntersection) {
    return z.intersection(
      coerceParams(
        (schema as z.ZodIntersection<z.ZodTypeAny, z.ZodTypeAny>)._def.left
      ),
      coerceParams(
        (schema as z.ZodIntersection<z.ZodTypeAny, z.ZodTypeAny>)._def.right
      )
    ) as any;
  }
  if (schema instanceof z.ZodRecord) {
    return z.record(
      coerceParams(
        (schema as z.ZodRecord<z.ZodString, z.ZodTypeAny>).keySchema
      ),
      coerceParams(
        (schema as z.ZodRecord<z.ZodString, z.ZodTypeAny>).valueSchema
      )
    ) as any;
  }
  if (schema instanceof z.ZodOptional) {
    return coerceParams(
      (schema as z.ZodOptional<z.ZodTypeAny>).unwrap()
    ).optional() as any;
  }
  if (schema instanceof z.ZodNullable) {
    return coerceParams(
      (schema as z.ZodNullable<z.ZodTypeAny>).unwrap()
    ).nullable() as any;
  }
  if (schema instanceof z.ZodTuple) {
    return z
      .tuple(schema.items.map(coerceParams))
      .rest(
        coerceParams(
          (
            schema as z.ZodTuple<
              [z.ZodTypeAny, ...z.ZodTypeAny[]],
              z.ZodTypeAny
            >
          )._def.rest
        )
      ) as any;
  }
  return schema;
}
