import { extendZodWithOpenApi } from "zod-openapi";
import {
  z,
  ParseContext,
  SafeParseReturnType,
  isValid,
  ZodFirstPartyTypeKind,
} from "zod";
import { StlContext } from "./stl";
import { SelectTree } from "./parseSelect";
import { getSelects } from "./selects";
import { getIncludes, IncludablePaths } from "./includes";
import { pickBy } from "lodash/fp";
import { mapValues } from "lodash";

export * from "zod";
export { selects, selectsSymbol, getSelects } from "./selects";
export {
  includes,
  includesSymbol,
  getIncludes,
  IncludablePaths,
} from "./includes";

/**
 * TODO: try to come up with a better error message
 * that you must import stl _before_ zod
 * in any file that uses z.openapi(),
 * including the file that calls stl.openapiSpec().
 */
extendZodWithOpenApi(z); // https://github.com/asteasolutions/zod-to-openapi#the-openapi-method

//////////////////////////////////////////////////
//////////////////////////////////////////////////
////////////////// Metadata //////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

declare module "zod" {
  interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
    withMetadata<M extends object>(metadata: M): ZodMetadata<this, M>;
  }
}

export interface ZodMetadataDef<T extends z.ZodTypeAny, M extends object>
  extends z.ZodEffectsDef {
  innerType: T;
  metadata: M;
}

/**
 * Class for storing custom metadata like `prismaModel`,
 * `pageResponse: true`, `includable: true`, etc.
 *
 * zod-openapi errors out on any new class that extends the base
 * ZodType, so I made this extend a no-op refinement for compatibility.
 * Extending ZodLazy would be another option
 */
export class ZodMetadata<
  T extends z.ZodTypeAny,
  M extends object
> extends z.ZodEffects<T> {
  constructor(def: z.ZodEffectsDef<T>, public metadata: M) {
    super(def);
  }

  unwrap() {
    return this._def.schema;
  }

  static create = <T extends z.ZodTypeAny, M extends object>(
    innerType: T,
    metadata: M,
    params?: z.RawCreateParams
  ): ZodMetadata<T, M> => {
    return new ZodMetadata(innerType.refine((x) => true)._def, metadata);
  };
}

z.ZodType.prototype.withMetadata = function withMetadata<
  T extends z.ZodTypeAny,
  M extends object
>(this: T, metadata: M): ZodMetadata<T, M> {
  return ZodMetadata.create(this, metadata, this._def);
};

export const withMetadata = ZodMetadata.create;

export type extractMetadata<
  T extends z.ZodTypeAny,
  Satisfying extends object = object
> = z.ZodType<any, z.ZodTypeDef, any> extends T
  ? never // bail if T is too generic, to prevent combinatorial explosion
  : T extends ZodMetadata<infer U, infer M>
  ? M extends Satisfying
    ? M
    : extractMetadata<U, Satisfying>
  : T extends z.ZodOptional<infer U>
  ? extractMetadata<U, Satisfying>
  : T extends z.ZodNullable<infer U>
  ? extractMetadata<U, Satisfying>
  : T extends z.ZodDefault<infer U>
  ? extractMetadata<U, Satisfying>
  : T extends z.ZodLazy<infer U>
  ? extractMetadata<U, Satisfying>
  : T extends z.ZodEffects<infer U, any, any>
  ? extractMetadata<U, Satisfying>
  : T extends z.ZodCatch<infer U>
  ? extractMetadata<U, Satisfying>
  : T extends z.ZodBranded<infer U, any>
  ? extractMetadata<U, Satisfying>
  : T extends z.ZodPipeline<any, infer U>
  ? extractMetadata<U, Satisfying>
  : T extends z.ZodPromise<infer U>
  ? extractMetadata<U, Satisfying>
  : never;

function satisfies(a: unknown, b: unknown): boolean {
  if (Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      a.length === b.length &&
      a.every((elem, i) => satisfies(elem, b[i]))
    );
  }
  if (b != null && typeof b === "object") {
    return (
      a != null &&
      typeof a === "object" &&
      Object.entries(b).every(([key, value]) =>
        satisfies((a as Record<string, unknown>)[key], value)
      )
    );
  }
  if (typeof b === "function") {
    return typeof a === "function";
  }
  return Object.is(a, b);
}

export function extractMetadata<
  T extends z.ZodTypeAny,
  Satisfying extends object = object
>(
  schema: T,
  satisfying: Satisfying = {} as Satisfying
): extractMetadata<T, Satisfying> {
  if (schema instanceof ZodMetadata) {
    if (satisfies(schema.metadata, satisfying)) {
      return schema.metadata;
    }
    return extractMetadata(schema.unwrap(), satisfying);
  }
  if (schema instanceof z.ZodOptional)
    return extractMetadata(schema.unwrap(), satisfying);
  if (schema instanceof z.ZodNullable)
    return extractMetadata(schema.unwrap(), satisfying);
  if (schema instanceof z.ZodDefault)
    return extractMetadata(schema.removeDefault(), satisfying);
  if (schema instanceof z.ZodLazy)
    return extractMetadata(schema.schema, satisfying);
  if (schema instanceof z.ZodEffects)
    return extractMetadata(schema._def.schema, satisfying);
  if (schema instanceof z.ZodCatch)
    return extractMetadata(schema.removeCatch(), satisfying);
  if (schema instanceof z.ZodBranded)
    return extractMetadata(schema.unwrap(), satisfying);
  if (schema instanceof z.ZodPipeline)
    return extractMetadata(schema._def.out, satisfying);
  if (schema instanceof z.ZodPromise)
    return extractMetadata(schema.unwrap(), satisfying);
  return undefined as never;
}

export type extractDeepMetadata<
  T extends z.ZodTypeAny,
  Satisfying extends object = object
> = z.ZodType<any, z.ZodTypeDef, any> extends T
  ? never // bail if T is too generic, to prevent combinatorial explosion
  : T extends ZodMetadata<infer U, infer M>
  ? M extends Satisfying
    ? M
    : extractDeepMetadata<U, Satisfying>
  : T extends z.ZodOptional<infer U>
  ? extractDeepMetadata<U, Satisfying>
  : T extends z.ZodNullable<infer U>
  ? extractDeepMetadata<U, Satisfying>
  : T extends z.ZodDefault<infer U>
  ? extractDeepMetadata<U, Satisfying>
  : T extends z.ZodLazy<infer U>
  ? extractDeepMetadata<U, Satisfying>
  : T extends z.ZodEffects<infer U, any, any>
  ? extractDeepMetadata<U, Satisfying>
  : T extends z.ZodCatch<infer U>
  ? extractDeepMetadata<U, Satisfying>
  : T extends z.ZodBranded<infer U, any>
  ? extractDeepMetadata<U, Satisfying>
  : T extends z.ZodPipeline<any, infer U>
  ? extractDeepMetadata<U, Satisfying>
  : T extends z.ZodPromise<infer U>
  ? extractDeepMetadata<U, Satisfying>
  : T extends z.ZodArray<infer U>
  ? extractDeepMetadata<U, Satisfying>
  : T extends z.ZodSet<infer U>
  ? extractDeepMetadata<U, Satisfying>
  : never;

export function extractDeepMetadata<
  T extends z.ZodTypeAny,
  Satisfying extends object = object
>(
  schema: T,
  satisfying: Satisfying = {} as Satisfying
): extractDeepMetadata<T, Satisfying> {
  if (schema instanceof z.ZodArray)
    return extractDeepMetadata(schema.element, satisfying);
  if (schema instanceof z.ZodSet)
    return extractDeepMetadata(schema._def.valueType, satisfying);
  return extractMetadata(schema, satisfying) as extractDeepMetadata<
    T,
    Satisfying
  >;
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
/////////////// Includable ///////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

declare module "zod" {
  interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
    /**
     * Marks this schema as includable via an `include[]` query param.
     * This should only be used on object or array of object property schemas.
     */
    includable(): IncludableZodType<this>;
  }
}

export const includableSymbol = Symbol("includable");

export type IncludableOutput<T> =
  | (NonNullable<T> & {
      readonly [includableSymbol]: { value: T };
    })
  | null
  | undefined;

export type IncludableInput<T> = T | null | undefined;

export type IncludableZodType<T extends z.ZodTypeAny> = ZodMetadata<
  z.ZodType<
    IncludableOutput<z.output<T>>,
    T["_def"],
    IncludableInput<z.input<T>>
  >,
  { stainless: { includable: true } }
>;

z.ZodType.prototype.includable = function includable(this: z.ZodTypeAny) {
  return stlPreprocess(
    (data: unknown, stlContext: StlContext<any>, zodInput: z.ParseInput) => {
      const { path } = zodInput;
      const include = getIncludes(stlContext);
      return include && zodPathIsIncluded(path, include) ? data : undefined;
    },
    this.optional()
  )
    .openapi({ effectType: "input" })
    .withMetadata({ stainless: { includable: true } });
};

export type isIncludable<T extends z.ZodTypeAny> = extractDeepMetadata<
  T,
  { stainless: { includable: true } }
> extends { stainless: { includable: true } }
  ? true
  : false;

export function isIncludable<T extends z.ZodTypeAny>(
  schema: T
): isIncludable<T> {
  return (extractDeepMetadata(schema, { stainless: { includable: true } }) !=
    null) as isIncludable<T>;
}

function zodPathIsIncluded(
  zodPath: (string | number)[],
  include: string[]
): boolean {
  const zodPathStr = zodPath.filter((p) => typeof p === "string").join(".");
  return include.some(
    (e) => e === zodPathStr || e.startsWith(`${zodPathStr}.`)
  );
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
/////////////// Selectable ///////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

declare module "zod" {
  // I don't know why TS errors without this, sigh
  interface ZodTypeDef {}

  interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
    selection<T extends z.ZodTypeAny>(
      this: T
    ): z.ZodType<
      SelectionReturn<z.output<T>>,
      this["_def"],
      SelectionReturn<z.input<T>>
    >;

    /**
     * Marks this schema as selectable via a `select` query param.
     * This should only be used on object or array of object property schemas.
     * The property must have the name of a sibling property + `_fields`.
     */
    selectable(): SelectableZodType<this>;
  }
}

export const selectableSymbol = Symbol("selectable");

export type SelectableOutput<T> =
  | ((NonNullable<T> extends Array<infer E>
      ? Partial<E>[]
      : NonNullable<T> extends object
      ? Partial<NonNullable<T>>
      : T) & {
      readonly [selectableSymbol]: true;
    })
  | null
  | undefined;

export type SelectableInput<T> =
  | T
  | (NonNullable<T> extends Array<infer E extends object>
      ? Partial<E>[]
      : NonNullable<T> extends object
      ? Partial<NonNullable<T>>
      : T)
  | null
  | undefined;

export type SelectableZodType<T extends z.ZodTypeAny> = z.ZodType<
  SelectableOutput<z.output<T>>,
  T["_def"],
  SelectableInput<z.input<T>>
>;

type SelectionReturn<T> = T extends Array<infer E extends object>
  ? Partial<E>[]
  : T extends object
  ? Partial<T>
  : T;

/**
 * A .selectable() property like `comments_fields`
 * actually parses the parent object's `comments`
 * property as input.
 *
 * As a consequence if `.selectable()` gets wrapped with
 * `.optional()`, the optional will see that there's no
 * value for `comments_fields` and abort before
 * `StlSelectable` gets to work its magic.
 */
class StlSelectable<T extends z.ZodTypeAny> extends z.ZodOptional<T> {
  _parse(input: z.ParseInput): z.ParseReturnType<this["_output"]> {
    const { path, parent } = input;
    const ctx = getStlParseContext(parent);
    const select = ctx ? getSelects(ctx) : undefined;
    if (!select) return z.OK(undefined);
    const property = path[path.length - 1];
    if (typeof property !== "string" || !property.endsWith("_fields")) {
      throw new Error(
        `.selectable() property must be a string ending with _fields`
      );
    }
    const parentData = parent.data || parent.parent?.data;
    if (!(parentData instanceof Object) || typeof property !== "string") {
      return z.OK(undefined);
    }
    const selectionHere = path.reduce<SelectTree | undefined>(
      (tree, elem) => (typeof elem === "number" ? tree : tree?.select?.[elem]),
      select
    )?.select;
    if (!selectionHere) return z.OK(undefined);

    const parsed = super._parse(
      Object.create(input, {
        data: { value: parentData[property.replace(/_fields$/, "")] },
      })
    );

    const pickSelected = pickBy((v, k) => selectionHere[k]);

    return convertParseReturn(parsed, (value) =>
      Array.isArray(value) ? value.map(pickSelected) : pickSelected(value)
    );
  }
}

z.ZodType.prototype.selection = function selection(
  this: z.ZodTypeAny
): z.ZodTypeAny {
  if (this instanceof ZodMetadata) {
    return this.unwrap().selection();
  }
  if (this instanceof z.ZodLazy) {
    return this.schema.selection();
  }
  if (!(this instanceof z.ZodObject)) {
    throw new Error(
      `.selection() must be called on a ZodObject, got ${this.constructor.name}`
    );
  }
  const { shape } = this;
  // don't wrap StlSelectable fields with ZodOptional,
  // because they don't rely on the _field property
  // acually being present
  const mask = mapValues(shape, (value) =>
    value instanceof StlSelectable ? undefined : (true as const)
  );
  return this.partial(mask);
};

z.ZodType.prototype.selectable = function selectable(this: z.ZodTypeAny) {
  return new StlSelectable(this.optional()._def);
};

//////////////////////////////////////////////////
//////////////////////////////////////////////////
/////////////// StlTransform /////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

declare module "zod" {
  interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
    safeParseAsync(
      data: unknown,
      params?: Partial<StlParseParams>
    ): Promise<SafeParseReturnType<Input, Output>>;

    parseAsync(
      data: unknown,
      params?: Partial<StlParseParams>
    ): Promise<Output>;

    transform<T extends z.ZodTypeAny, NewOut>(
      this: T,
      transform: (
        arg: Output,
        ctx: StlRefinementCtx
      ) => NewOut | Promise<NewOut>
    ): z.ZodEffects<T, NewOut>;

    /**
     * Like `.transform()`, but passes the StlContext and ParseContext
     * to the transform.
     * Currently this is used to implement `.prismaModelLoader()` in the
     * Prisma plugin.
     */
    stlTransform<T extends z.ZodTypeAny, NewOut>(
      this: T,
      transform: StlTransform<Output, NewOut>
    ): z.ZodEffects<T, NewOut>;
  }
}

export type StlTransform<Input, Output> = (
  input: Input,
  ctx: StlContext<any>,
  zodInput: z.ParseInput
) => Output | Promise<Output>;

export interface StlParseContext extends z.ParseContext {
  stlContext?: StlContext<any>;
}

export interface StlRefinementCtx extends z.RefinementCtx {
  stlContext?: StlContext<any>;
}

export type StlParseParams = z.ParseParams & {
  stlContext: StlContext<any>;
};

export type StlParseInput = z.ParseInput & {
  parent: StlParseContext;
};

function getStlParseContext(
  ctx: ParseContext
): StlParseContext["stlContext"] | undefined {
  while (ctx.parent != null) ctx = ctx.parent;
  return (ctx as any).stlContext;
}
function handleParseReturn<I, O>(
  result: z.ParseReturnType<I>,
  handle: (result: z.SyncParseReturnType<I>) => z.SyncParseReturnType<O>
): z.ParseReturnType<O> {
  return z.isAsync(result) ? result.then(handle) : handle(result);
}

function convertParseReturn<I, O>(
  result: z.ParseReturnType<I>,
  convert: (result: I) => O
): z.ParseReturnType<O> {
  return handleParseReturn(
    result,
    (result: z.SyncParseReturnType<I>): z.SyncParseReturnType<O> => {
      switch (result.status) {
        case "aborted":
          return result;
        case "dirty":
          return z.DIRTY(convert(result.value));
        case "valid":
          return z.OK(convert(result.value));
      }
    }
  );
}

z.ZodType.prototype.safeParseAsync = async function safeParseAsync(
  data: unknown,
  params?: Partial<StlParseParams>
): Promise<z.SafeParseReturnType<any, any>> {
  const ctx: StlParseContext = {
    stlContext: params?.stlContext,
    common: {
      issues: [],
      contextualErrorMap: params?.errorMap,
      async: true,
    },
    path: params?.path || [],
    schemaErrorMap: this._def.errorMap,
    parent: null,
    data,
    parsedType: z.getParsedType(data),
  };

  const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
  const result = await (z.isAsync(maybeAsyncResult)
    ? maybeAsyncResult
    : Promise.resolve(maybeAsyncResult));
  return handleResult(ctx, result);
};

const handleResult = <Input, Output>(
  ctx: z.ParseContext,
  result: z.SyncParseReturnType<Output>
):
  | { success: true; data: Output }
  | { success: false; error: z.ZodError<Input> } => {
  if (z.isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }

    return {
      success: false,
      get error() {
        if ((this as any)._error) return (this as any)._error as Error;
        const error = new z.ZodError(ctx.common.issues);
        (this as any)._error = error;
        return (this as any)._error;
      },
    };
  }
};

const zodEffectsSuperParse = z.ZodEffects.prototype._parse;
z.ZodEffects.prototype._parse = function _parse(
  input: z.ParseInput
): z.ParseReturnType<any> {
  const effect: any = this._def.effect || null;
  if (effect.stlPreprocess) {
    const stlContext = getStlParseContext(input.parent);
    if (!stlContext) {
      throw new Error(`missing stlContext in .stlTransform effect`);
    }
    const { ctx } = this._processInputParams(input);
    const processed = effect.transform(ctx.data, stlContext, {
      data: ctx.data,
      path: ctx.path,
      parent: ctx,
    });
    if (ctx.common.issues.length) {
      return {
        status: "dirty",
        value: ctx.data,
      };
    }

    if (ctx.common.async) {
      return Promise.resolve(processed).then((processed) => {
        return this._def.schema._parseAsync({
          data: processed,
          path: ctx.path,
          parent: ctx,
        });
      });
    } else {
      return this._def.schema._parseSync({
        data: processed,
        path: ctx.path,
        parent: ctx,
      });
    }
  }
  if (effect.stlTransform) {
    const stlContext = getStlParseContext(input.parent);
    if (!stlContext) {
      throw new Error(`missing stlContext in .stlTransform effect`);
    }
    const { status, ctx } = this._processInputParams(input);
    return this._def.schema
      ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
      .then((base: any) => {
        if (!isValid(base)) return base;

        return Promise.resolve(
          effect.transform(base.value, stlContext, {
            data: base.value,
            path: input.path,
            parent: input.parent,
          })
        ).then((result) => ({ status: status.value, value: result }));
      });
  }
  return zodEffectsSuperParse.call(this, input);
};

z.ZodType.prototype.stlTransform = function stlTransform(
  this: z.ZodTypeAny,
  transform: StlTransform<any, any>
) {
  return new z.ZodEffects({
    description: this._def.description,
    schema: this,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect: {
      type: "transform",
      transform,
      stlTransform: true,
    } as any,
  }) as any;
};

export type StlPreprocess = (
  input: unknown,
  ctx: StlContext<any>,
  zodInput: z.ParseInput
) => unknown;

export function stlPreprocess<I extends z.ZodTypeAny>(
  preprocess: StlPreprocess,
  schema: I
): z.ZodEffects<I, I["_output"], unknown> {
  return new z.ZodEffects({
    description: schema._def.description,
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect: {
      type: "preprocess",
      transform: preprocess,
      stlPreprocess: true,
    } as any,
  }) as any;
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
/////////////// REST Types ///////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

export function path<T extends z.ZodRawShape>(
  shape: T,
  params?: z.RawCreateParams
): z.ZodObject<T, "strip"> {
  return z.object(shape, params);
}

// TODO: make properties optional by default
export class StlParams<
  T extends z.ZodRawShape,
  UnknownKeys extends z.UnknownKeysParam = z.UnknownKeysParam,
  Catchall extends z.ZodTypeAny = z.ZodTypeAny,
  Output = z.objectOutputType<T, Catchall, UnknownKeys>,
  Input = z.objectInputType<T, Catchall, UnknownKeys>
> extends z.ZodObject<T, UnknownKeys, Catchall, Output, Input> {}

export function query<T extends z.ZodRawShape>(
  shape: T,
  params?: z.RawCreateParams
): StlParams<T, "strip"> {
  return new StlParams(z.object(shape, params)._def) as any;
}

export function body<T extends z.ZodRawShape>(
  shape: T,
  params?: z.RawCreateParams
): StlParams<T, "strip"> {
  return new StlParams(z.object(shape, params)._def) as any;
}

export function response<T extends z.ZodRawShape>(
  shape: T,
  params?: z.RawCreateParams
): z.ZodObject<T, "strip"> {
  return z.object(shape, params);
}

const commonPageResponseFields = {
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
  hasNextPage: z.boolean().optional(),
  hasPreviousPage: z.boolean().optional(),
};

class PageResponseWrapper<I extends z.ZodTypeAny> {
  wrapped(item: I) {
    return z.object({
      ...commonPageResponseFields,
      items: z.array(item),
    });
  }
}

export function pageResponse<I extends z.ZodTypeAny>(
  item: I
): ZodMetadata<
  ReturnType<PageResponseWrapper<I>["wrapped"]>,
  extractDeepMetadata<I> & { stainless: { pageResponse: true } }
> {
  const baseMetadata: any = extractDeepMetadata(item);
  return response({
    ...commonPageResponseFields,
    items: z.array(item),
  }).withMetadata({
    ...baseMetadata,
    stainless: {
      ...baseMetadata?.stainless,
      pageResponse: true,
    },
  });
}

export type isPageResponse<T extends z.ZodTypeAny> = extractMetadata<
  T,
  { stainless: { pageResponse: true } }
> extends { stainless: { pageResponse: true } }
  ? true
  : false;

export function isPageResponse<T extends z.ZodTypeAny>(
  schema: T
): isPageResponse<T> {
  return (extractMetadata(schema, { stainless: { pageResponse: true } }) !=
    null) as isPageResponse<T>;
}

export type PageData<I> = {
  items: I[];
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
};

export type PageItemType<D> = D extends PageData<any>
  ? D["items"][number]
  : never;

export const AnyPageData: z.ZodType<
  PageData<any>,
  any,
  PageData<any>
> = z.object({
  items: z.array(z.any()),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
  hasNextPage: z.boolean().optional(),
  hasPreviousPage: z.boolean().optional(),
});

export const SortDirection = z.union([z.literal("asc"), z.literal("desc")]);
export type SortDirection = z.infer<typeof SortDirection>;

export const PaginationParams = z.object({
  pageAfter: z.string().optional(),
  pageBefore: z.string().optional(),
  pageSize: z.coerce.number().positive().default(20),
  // TODO consider whether/how to expose these by default.
  sortBy: z.string(),
  sortDirection: SortDirection.default("asc"),
});

export type PaginationParams = z.infer<typeof PaginationParams>;

export type CircularModel<
  Base extends z.ZodType<object, any, object>,
  Props extends z.ZodRawShape
> = z.ZodType<
  z.output<Base> & { [K in keyof Props]: z.output<NonNullable<Props[K]>> },
  z.ZodTypeDef,
  z.input<Base> & { [K in keyof Props]: z.input<NonNullable<Props[K]>> }

  //////////////////////////////////////////////////
  //////////////////////////////////////////////////
  ////////////// codegen schemas ///////////////////
  //////////////////////////////////////////////////
  //////////////////////////////////////////////////
>;

export const SchemaSymbol = Symbol("SchemaType");

export abstract class BaseSchema {
  declare [SchemaSymbol]: true;
  declare abstract input: any;
  declare abstract output: any;
  declare metadata?: object;
}

export class Schema<O, I = O> extends BaseSchema {
  declare input: I;
  declare output: O;
  declare default: O | (() => O);

  validate(value: Out<I>, ctx: StlContext<any>): void {}
  transform(
    value: Out<I>,
    ctx: StlContext<any>,
    zodInput: z.ParseInput
  ): Out<O> | PromiseLike<Out<O>> {
    return value as any;
  }
}

export type SchemaInput<I> = I | Schema<I, any>;

export const EffectlessSchemaSymbol = Symbol("EffectlessSchema");

export class Metadata<O, Metadata extends object> extends Schema<O> {
  declare metadata: Metadata;
}
export const EffectsSymbol = Symbol("Effects");

export const TransformSymbol = Symbol("Transform");

export type In<T> = 0 extends 1 & T
  ? any
  : T extends BaseSchema
  ? In<T["input"]>
  : T extends Date
  ? Date
  : T extends Array<infer E>
  ? Array<In<E>>
  : T extends Set<infer E>
  ? Set<In<E>>
  : T extends Map<infer K, infer V>
  ? Map<In<K>, In<V>>
  : T extends PromiseLike<infer E>
  ? PromiseLike<In<E>>
  : T extends object
  ? { [k in keyof T]: In<T[k]> }
  : T;

export type Out<T> = 0 extends 1 & T
  ? any
  : T extends BaseSchema
  ? Out<T["output"]>
  : T extends Date
  ? Date
  : T extends Array<infer E>
  ? Array<Out<E>>
  : T extends Set<infer E>
  ? Set<Out<E>>
  : T extends Map<infer K, infer V>
  ? Map<Out<K>, Out<V>>
  : T extends PromiseLike<infer E>
  ? PromiseLike<Out<E>>
  : T extends object
  ? { [k in keyof T]: Out<T[k]> }
  : T;

export type toZod<T> = 0 extends 1 & T
  ? any
  : [null | undefined] extends [T]
  ? z.ZodOptional<z.ZodNullable<toZod<NonNullable<T>>>>
  : [null] extends [T]
  ? z.ZodNullable<toZod<NonNullable<T>>>
  : [undefined] extends [T]
  ? z.ZodOptional<toZod<NonNullable<T>>>
  : [T] extends [z.ZodTypeAny]
  ? T
  : [T] extends [BaseSchema]
  ? schemaTypeToZod<T>
  : [T] extends [Date]
  ? z.ZodDate
  : [T] extends [Array<infer E>]
  ? z.ZodArray<toZod<E>>
  : [T] extends [Set<infer E>]
  ? z.ZodSet<toZod<E>>
  : [T] extends [Map<infer K, infer V>]
  ? z.ZodMap<toZod<K>, toZod<V>>
  : [T] extends [PromiseLike<infer E>]
  ? z.ZodPromise<toZod<E>>
  : [T] extends [object]
  ? z.ZodObject<{ [k in keyof T]-?: toZod<T[k]> }>
  : [number] extends [T]
  ? z.ZodNumber
  : [string] extends [T]
  ? z.ZodString
  : [boolean] extends [T]
  ? z.ZodBoolean
  : [bigint] extends [T]
  ? z.ZodBigInt
  : z.ZodType<Out<T>, any, In<T>>;

type schemaTypeToZod<T extends BaseSchema> = T extends {
  metadata: infer M extends object;
}
  ? ZodMetadata<toZod<Omit<T, "metadata">>, M>
  : T extends {
      [ZodSchemaSymbol]: true;
      zodSchema: infer S extends z.ZodTypeAny;
    }
  ? S
  : T extends {
      [IncludableSymbol]: true;
      includable: infer I;
    }
  ? z.ZodEffects<toZod<I>, IncludableOutput<Out<I>>, IncludableInput<In<I>>>
  : T extends { [EffectsSymbol]: true; input: infer I; output: infer O }
  ? z.ZodEffects<toZod<I>, Out<O>, In<I>>
  : toZod<T["output"]>;

export type OptionalMessage<T> = T extends true
  ? true | string
  : T | [T, string];

export type IPOptions =
  | true
  | string
  | {
      version?: "v4" | "v6";
      message?: string;
    };

export type DateTimeOptions =
  | true
  | string
  | {
      precision?: number;
      offset?: true;
      message?: string;
    };

export interface StringSchemaProps {
  max?: OptionalMessage<number>;
  min?: OptionalMessage<number>;
  length?: OptionalMessage<number>;

  email?: OptionalMessage<true>;
  url?: OptionalMessage<true>;
  emoji?: OptionalMessage<true>;
  uuid?: OptionalMessage<true>;
  cuid?: OptionalMessage<true>;
  cuid2?: OptionalMessage<true>;
  ulid?: OptionalMessage<true>;

  regex?: OptionalMessage<string>;
  startsWith?: OptionalMessage<string>;
  endsWith?: OptionalMessage<string>;

  datetime?: DateTimeOptions;
  ip?: IPOptions;

  // transformations
  trim?: true;
  toLowerCase?: true;
  toUpperCase?: true;

  default?: string;
}

export type UUID = StringSchema<{ uuid: true }>;

export const StringSchemaSymbol = Symbol("StringSchema");

export class StringSchema<
  Props extends StringSchemaProps
> extends Schema<string> {
  declare [StringSchemaSymbol]: true;
  declare input: string;
  declare props: Props;
}

export interface NumberSchemaProps {
  gt?: OptionalMessage<number>;
  gte?: OptionalMessage<number>;
  min?: OptionalMessage<number>;
  lt?: OptionalMessage<number>;
  lte?: OptionalMessage<number>;
  max?: OptionalMessage<number>;

  multipleOf?: OptionalMessage<number>;
  step?: OptionalMessage<number>;

  int?: OptionalMessage<true>;
  positive?: OptionalMessage<true>;
  nonnegative?: OptionalMessage<true>;
  negative?: OptionalMessage<true>;
  nonpositive?: OptionalMessage<true>;
  finite?: OptionalMessage<true>;
  safe?: OptionalMessage<true>;

  default?: number;
}

export const NumberSchemaSymbol = Symbol("NumberSchema");

export class NumberSchema<
  Props extends NumberSchemaProps
> extends Schema<number> {
  declare [NumberSchemaSymbol]: true;
  declare input: number;
  declare props: Props;
}

export interface BigIntSchemaProps {
  gt?: OptionalMessage<bigint>;
  gte?: OptionalMessage<bigint>;
  min?: OptionalMessage<bigint>;
  lt?: OptionalMessage<bigint>;
  lte?: OptionalMessage<bigint>;
  max?: OptionalMessage<bigint>;

  multipleOf?: OptionalMessage<bigint>;

  positive?: OptionalMessage<true>;
  nonnegative?: OptionalMessage<true>;
  negative?: OptionalMessage<true>;
  nonpositive?: OptionalMessage<true>;

  default?: bigint;
}

export const BigIntSchemaSymbol = Symbol("BigIntSchema");

export class BigIntSchema<
  Props extends BigIntSchemaProps
> extends Schema<bigint> {
  declare [BigIntSchemaSymbol]: true;
  declare input: bigint;
  declare props: Props;
}

export interface DateSchemaProps {
  min?: OptionalMessage<string>;
  max?: OptionalMessage<string>;
}

export const DateSchemaSymbol = Symbol("DateSchema");

export class DateSchema<Props extends DateSchemaProps> extends Schema<Date> {
  declare [DateSchemaSymbol]: true;
  declare input: Date;
  declare props: Props;
}

export interface ObjectSchemaProps {
  passthrough?: OptionalMessage<true>;
  strict?: OptionalMessage<true>;
  catchall?: any;
}

export const ObjectSchemaSymbol = Symbol("ObjectSchema");

export class ObjectSchema<
  T extends object,
  Props extends ObjectSchemaProps
> extends Schema<T> {
  declare [ObjectSchemaSymbol]: true;
  declare props: Props;
}

export interface ArraySchemaProps {
  nonempty?: OptionalMessage<true>;

  min?: OptionalMessage<number>;
  max?: OptionalMessage<number>;
  length?: OptionalMessage<number>;
}

export const ArraySchemaSymbol = Symbol("ArraySchema");

export class ArraySchema<T, Props extends ArraySchemaProps> extends Schema<
  T[]
> {
  declare [ArraySchemaSymbol]: true;
  declare props: Props;
}

export const SetSchemaSymbol = Symbol("SetSchema");

type SetSchemaProps = ArraySchemaProps;

export class SetSchema<T, Props extends SetSchemaProps> extends Schema<Set<T>> {
  declare [SetSchemaSymbol]: true;
  declare props: Props;
}

export const IncludableSymbol = Symbol("Includable");

export class Includable<T> extends Schema<
  IncludableOutput<Out<T>>,
  IncludableInput<In<T>>
> {
  declare [IncludableSymbol]: true;
  declare includable: T;
  declare metadata: { stainless: { includable: true } };
}

export class Includes<
  T,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3
> extends Schema<IncludablePaths<Out<T>, Depth>[]> {
  declare metadata: { stainless: { includes: true } };
}

export const SelectableSymbol = Symbol("Selectable");

export class Selectable<T> extends Schema<
  SelectableOutput<Out<T>>,
  SelectableInput<In<T>>
> {
  declare [SelectableSymbol]: true;
  declare selectable: T;
  declare metadata: { stainless: { selectable: true } };
}

export class Selects<T, Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3> extends Schema<
  SelectTree | null | undefined,
  string
> {
  declare [EffectsSymbol]: true;
  declare metadata: { stainless: { selects: true } };
}

export class Selection<T extends SchemaInput<any>> extends Schema<T> {}

export interface PageResponseType<I> {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  items: I[];
}

const PageResponseSymbol = Symbol("PageResponse");

export class PageResponse<I> extends Schema<PageResponseType<I>> {
  declare [PageResponseSymbol]: true;
  declare item: I;
}

const ZodSchemaSymbol = Symbol("ZodSchema");

export class ZodSchema<S extends { schema: z.ZodTypeAny }> extends Schema<
  z.output<S["schema"]>,
  z.input<S["schema"]>
> {
  declare [ZodSchemaSymbol]: true;
  declare zodSchema: S["schema"];
}
