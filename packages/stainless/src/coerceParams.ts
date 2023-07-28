import * as z from "./z";

// z.coerce has problems in general...
// z.coerce.boolean().parse('false') === true
// z.coerce.number().parse('') === 0
// z.coerce.string().parse(undefined) === 'undefined'

const defaultCoerceBoolean = z.preprocess((value) => {
  switch (typeof value === "string" ? value.toLowerCase() : value) {
    case undefined:
    case null:
    case true:
    case false:
      return value;
    case "t":
    case "true":
      return true;
    case "f":
    case "false":
      return false;
  }
  return Boolean(value);
}, z.boolean().nullish());

const defaultCoerceString = z.preprocess(
  (value) => (value == null ? value : String(value)),
  z.string().nullish()
);

const defaultCoerceNumber = z.preprocess(
  (value) => (value == null ? value : value === "" ? NaN : Number(value)),
  z.number().nullish()
);

const defaultCoerceBigInt = z.preprocess(
  (value) =>
    value == null ? value : value === "" ? undefined : BigInt(String(value)),
  z.bigint().nullish()
);

const defaultCoerceDate = z.coerce.date();

export default function coerceParams<T extends z.ZodTypeAny>(
  schema: T,
  {
    coerceBoolean = defaultCoerceBoolean,
    coerceString = defaultCoerceString,
    coerceNumber = defaultCoerceNumber,
    coerceBigInt = defaultCoerceBigInt,
    coerceDate = defaultCoerceDate,
  }: {
    coerceBoolean?: z.ZodType<boolean | null | undefined, any, unknown>;
    coerceString?: z.ZodType<string | null | undefined, any, unknown>;
    coerceNumber?: z.ZodType<number | null | undefined, any, unknown>;
    coerceBigInt?: z.ZodType<bigint | null | undefined, any, unknown>;
    coerceDate?: z.ZodType<Date | null | undefined, any, unknown>;
  } = {}
): T {
  function coerceParamsInner<T extends z.ZodTypeAny>(
    schema: T,
    { discriminator }: { discriminator?: string } = {}
  ): T {
    if (schema instanceof z.ZodNumber) {
      return coerceNumber.pipe(schema) as any;
    }
    if (schema instanceof z.ZodBigInt) {
      return coerceBigInt.pipe(schema) as any;
    }
    if (schema instanceof z.ZodString) {
      return coerceString.pipe(schema) as any;
    }
    if (schema instanceof z.ZodBoolean) {
      return coerceBoolean as any;
    }
    if (schema instanceof z.ZodDate) {
      return coerceDate.pipe(schema) as any;
    }
    if (schema instanceof z.ZodLiteral) {
      switch (typeof schema.value) {
        case "string":
          return coerceString.pipe(schema) as any;
        case "number":
          return coerceNumber.pipe(schema) as any;
        case "bigint":
          return coerceBigInt.pipe(schema) as any;
        case "boolean":
          return coerceBoolean.pipe(schema) as any;
      }
      if (schema.value instanceof Date) {
        return coerceDate.pipe(schema) as any;
      }
      return schema;
    }
    if (schema instanceof z.ZodMetadata) {
      return coerceParamsInner(
        (schema as z.ZodMetadata<z.ZodTypeAny, any>).innerType()
      ).withMetadata(schema.metadata) as any;
    }
    if (schema instanceof z.ZodArray) {
      return coerceParamsInner(
        (schema as z.ZodArray<z.ZodTypeAny>).element
      ).array() as any;
    }
    if (schema instanceof z.ZodLazy) {
      return coerceParamsInner(
        (schema as z.ZodLazy<z.ZodTypeAny>).schema
      ) as any;
    }
    if (schema instanceof z.ZodObject) {
      return new z.ZodObject({
        ...schema._def,
        shape: () =>
          Object.fromEntries(
            Object.entries(schema.shape).map(([key, child]) => [
              key,
              key === discriminator
                ? child
                : coerceParamsInner(child as z.ZodTypeAny),
            ])
          ),
        catchall: coerceParamsInner(schema._def.catchall),
      }) as any;
    }
    if (schema instanceof z.ZodPromise) {
      return coerceParamsInner(
        (schema as z.ZodPromise<z.ZodTypeAny>).unwrap()
      ) as any;
    }
    if (schema instanceof z.ZodCatch) {
      return new z.ZodCatch({
        ...schema._def,
        innerType: coerceParamsInner(schema._def.innerType),
      }) as any;
    }
    if (schema instanceof z.ZodBranded) {
      return coerceParamsInner(
        (schema as z.ZodBranded<z.ZodTypeAny, any>).unwrap()
      ) as any;
    }
    if (schema instanceof z.ZodSet) {
      return z.set(
        coerceParamsInner((schema as z.ZodSet<z.ZodTypeAny>)._def.valueType)
      ) as any;
    }
    if (schema instanceof z.ZodDefault) {
      return coerceParamsInner(
        (schema as z.ZodDefault<z.ZodTypeAny>).removeDefault()
      ).default(schema._def.defaultValue()) as any;
    }
    if (schema instanceof z.ZodEffects) {
      return z.effect(
        coerceParamsInner((schema as z.ZodEffects<z.ZodTypeAny>).innerType()),
        schema._def.effect
      ) as any;
    }
    if (schema instanceof z.ZodPipeline) {
      return coerceParamsInner(
        (schema as z.ZodPipeline<z.ZodTypeAny, z.ZodTypeAny>)._def.in
      ).pipe(
        coerceParamsInner(
          (schema as z.ZodPipeline<z.ZodTypeAny, z.ZodTypeAny>)._def.out
        )
      ) as any;
    }
    if (schema instanceof z.ZodMap) {
      return z.map(
        coerceParamsInner(
          (schema as z.ZodMap<z.ZodTypeAny, z.ZodTypeAny>)._def.keyType
        ),
        coerceParamsInner(
          (schema as z.ZodMap<z.ZodTypeAny, z.ZodTypeAny>)._def.valueType
        )
      ) as any;
    }
    if (schema instanceof z.ZodDiscriminatedUnion) {
      const { discriminator } = schema;
      return z.discriminatedUnion(
        discriminator,
        schema.options.map((opt: z.ZodTypeAny) =>
          coerceParamsInner(opt, { discriminator })
        )
      ) as any;
    }
    if (schema instanceof z.ZodUnion) {
      return z.union(schema.options.map(coerceParamsInner)) as any;
    }
    if (schema instanceof z.ZodIntersection) {
      return z.intersection(
        coerceParamsInner(
          (schema as z.ZodIntersection<z.ZodTypeAny, z.ZodTypeAny>)._def.left
        ),
        coerceParamsInner(
          (schema as z.ZodIntersection<z.ZodTypeAny, z.ZodTypeAny>)._def.right
        )
      ) as any;
    }
    if (schema instanceof z.ZodRecord) {
      return z.record(
        coerceParamsInner(
          (schema as z.ZodRecord<z.ZodString, z.ZodTypeAny>).keySchema
        ),
        coerceParamsInner(
          (schema as z.ZodRecord<z.ZodString, z.ZodTypeAny>).valueSchema
        )
      ) as any;
    }
    if (schema instanceof z.ZodOptional) {
      return coerceParamsInner(
        (schema as z.ZodOptional<z.ZodTypeAny>).unwrap()
      ).optional() as any;
    }
    if (schema instanceof z.ZodNullable) {
      return coerceParamsInner(
        (schema as z.ZodNullable<z.ZodTypeAny>).unwrap()
      ).nullable() as any;
    }
    if (schema instanceof z.ZodTuple) {
      return z
        .tuple(schema.items.map(coerceParamsInner))
        .rest(
          coerceParamsInner(
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
  return coerceParamsInner(schema);
}
