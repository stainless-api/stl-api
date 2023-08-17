import { SelectTree, parseSelect } from "./parseSelect.js";
import * as z from "./z.js";
import { type StlContext } from "./stl.js";
import lodash from "lodash";
const { isEmpty, isPlainObject } = lodash;

export const selectsSymbol = Symbol("selects");

/**
 * Creates an select param from all selectable paths in the given zod schema
 */
export function selects<
  T extends z.ZodType<object>,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3
>(
  schema: T,
  depth: Depth = 3 as any
): z.ZodMetadata<
  z.ZodType<SelectTree | null | undefined, z.ZodEffectsDef, string>,
  { stainless: { selects: true } }
> {
  return z
    .string()
    .transform((select) => {
      const result = parseSelect(select);
      Object.defineProperty(result, selectsSymbol, {
        enumerable: false,
        value: true,
      });
      return result;
    })
    .superRefine((val, ctx) => {
      try {
        validateSelectTree(val, schema, depth + 1);
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    })
    .withMetadata({ stainless: { selects: true } });
}

function validateSelectTree(
  selectTree: SelectTree,
  schema: z.ZodTypeAny,
  depth: number,
  path: string[] = []
): SelectTree {
  if (depth < 0) {
    throw new Error(`selected path is too deep: ${path.join(".")}`);
  }
  const { select } = selectTree;

  if (schema instanceof z.ZodObject) {
    if (!select || isEmpty(select)) {
      if (depth === 0) {
        // last element of select path is an object, but object
        // properties would be one level too deep
        throw new Error(`selected path is too deep: ${path.join(".")}`);
      }
      return selectTree;
    }
    for (const key of Object.keys(select)) {
      const subtree = select[key];
      const subschema = schema.shape[key];
      if (!subschema) {
        throw new Error(
          `selected path doesn't exist: ${[...path, key].join(".")}`
        );
      }
      // TODO: error if a terminal field on a non-selectable object is selected,
      // like (posts) items.user.id.  This is tricky because items.user.comments_fields.id
      // is selectable, so we can't simply error when we get to items.user.
      validateSelectTree(subtree, subschema, depth - 1, [...path, key]);
    }
    return selectTree;
  }
  if (
    schema instanceof z.ZodNullable ||
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodMetadata
  ) {
    return validateSelectTree(selectTree, schema.unwrap(), depth, path);
  }
  if (schema instanceof z.ZodDefault) {
    return validateSelectTree(selectTree, schema._def.innerType, depth, path);
  }
  if (schema instanceof z.ZodLazy) {
    return validateSelectTree(selectTree, schema.schema, depth, path);
  }
  if (schema instanceof z.ZodArray) {
    return validateSelectTree(selectTree, schema.element, depth, path);
  }
  if (schema instanceof z.ZodEffects) {
    return validateSelectTree(selectTree, schema.innerType(), depth, path);
  }
  if (schema instanceof z.ZodPipeline) {
    return validateSelectTree(selectTree, schema._def.out, depth, path);
  }
  // TODO union, intersection, discriminated union?

  if (!select || isEmpty(select)) return selectTree;

  throw new Error(`unsupported schema type: ${schema.constructor.name}`);
}

export function getSelects(
  ctx: StlContext<any>
): SelectTree | null | undefined {
  const query = ctx.parsedParams?.query;
  if (!query) return undefined;
  for (const param of Object.values(query)) {
    if (param != null && (param as any)[selectsSymbol]) {
      const select = ctx.parsedParams?.query?.select;
      if (select != null && !isPlainObject(select)) {
        throw new Error(`invalid select param; use z.selects()`);
      }
      return select;
    }
  }
  return undefined;
}
