import * as z from "./z";

export default function deepCoerce<T extends z.ZodTypeAny>(schema: T): T {
  if (schema instanceof z.ZodNumber) {
    return z.number({ ...schema._def, coerce: true }) as any;
  }
  if (schema instanceof z.ZodString) {
    return z.string({ ...schema._def, coerce: true }) as any;
  }
  if (schema instanceof z.ZodBoolean) {
    return z.boolean({ ...schema._def, coerce: true }) as any;
  }
  if (schema instanceof z.ZodDate) {
    return z.date({ ...schema._def, coerce: true }) as any;
  }
  if (schema instanceof z.ZodMetadata) {
    return deepCoerce(
      (schema as z.ZodMetadata<z.ZodTypeAny, any>).innerType()
    ).withMetadata(schema.metadata) as any;
  }
  if (schema instanceof z.ZodArray) {
    return deepCoerce(
      (schema as z.ZodArray<z.ZodTypeAny>).element
    ).array() as any;
  }
  if (schema instanceof z.ZodLazy) {
    return deepCoerce(
      (schema as z.ZodLazy<z.ZodTypeAny>).schema
    ).array() as any;
  }
  if (schema instanceof z.ZodObject) {
    return new z.ZodObject({
      ...schema._def,
      shape: () =>
        Object.fromEntries(
          Object.entries(schema.shape).map(([key, child]) => [
            key,
            deepCoerce(child as z.ZodTypeAny),
          ])
        ),
      catchall: deepCoerce(schema._def.catchall),
    }) as any;
  }
  if (schema instanceof z.ZodPromise) {
    return deepCoerce((schema as z.ZodPromise<z.ZodTypeAny>).unwrap()) as any;
  }
  if (schema instanceof z.ZodCatch) {
    return new z.ZodCatch({
      ...schema._def,
      innerType: deepCoerce((schema as z.ZodCatch<z.ZodTypeAny>).removeCatch()),
    }) as any;
  }
  if (schema instanceof z.ZodBranded) {
    return deepCoerce(
      (schema as z.ZodBranded<z.ZodTypeAny, any>).unwrap()
    ) as any;
  }
  if (schema instanceof z.ZodSet) {
    return z.set(
      deepCoerce((schema as z.ZodSet<z.ZodTypeAny>)._def.valueType)
    ) as any;
  }
  if (schema instanceof z.ZodDefault) {
    return deepCoerce(
      (schema as z.ZodDefault<z.ZodTypeAny>).removeDefault()
    ).default(schema._def.defaultValue()) as any;
  }
  if (schema instanceof z.ZodEffects) {
    return z.effect(
      deepCoerce((schema as z.ZodEffects<z.ZodTypeAny>).innerType()),
      schema._def.effect
    ) as any;
  }
  if (schema instanceof z.ZodPipeline) {
    return deepCoerce(
      (schema as z.ZodPipeline<z.ZodTypeAny, z.ZodTypeAny>)._def.in
    ).pipe(
      deepCoerce((schema as z.ZodPipeline<z.ZodTypeAny, z.ZodTypeAny>)._def.out)
    ) as any;
  }
  if (schema instanceof z.ZodMap) {
    return z.record(
      deepCoerce((schema as z.ZodMap<z.ZodTypeAny, z.ZodTypeAny>)._def.keyType),
      deepCoerce(
        (schema as z.ZodMap<z.ZodTypeAny, z.ZodTypeAny>)._def.valueType
      )
    ) as any;
  }
  if (schema instanceof z.ZodDiscriminatedUnion) {
    return z.discriminatedUnion(
      schema.discriminator,
      schema.options.map(deepCoerce)
    ) as any;
  }
  if (schema instanceof z.ZodUnion) {
    return z.union(schema.options.map(deepCoerce)) as any;
  }
  if (schema instanceof z.ZodIntersection) {
    return z.intersection(
      deepCoerce(
        (schema as z.ZodIntersection<z.ZodTypeAny, z.ZodTypeAny>)._def.left
      ),
      deepCoerce(
        (schema as z.ZodIntersection<z.ZodTypeAny, z.ZodTypeAny>)._def.right
      )
    ) as any;
  }
  if (schema instanceof z.ZodRecord) {
    return z.record(
      deepCoerce((schema as z.ZodRecord<z.ZodString, z.ZodTypeAny>).keySchema),
      deepCoerce((schema as z.ZodRecord<z.ZodString, z.ZodTypeAny>).valueSchema)
    ) as any;
  }
  if (schema instanceof z.ZodOptional) {
    return deepCoerce(
      (schema as z.ZodOptional<z.ZodTypeAny>).unwrap()
    ).optional() as any;
  }
  if (schema instanceof z.ZodNullable) {
    return deepCoerce(
      (schema as z.ZodNullable<z.ZodTypeAny>).unwrap()
    ).nullable() as any;
  }
  if (schema instanceof z.ZodTuple) {
    return z
      .tuple(schema.items.map(deepCoerce))
      .rest(
        deepCoerce(
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
