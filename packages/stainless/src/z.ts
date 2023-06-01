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
import { getExpands } from "./expands";
import { omitBy, pickBy } from "lodash/fp";
import { mapValues } from "lodash";

export * from "zod";
export { selects } from "./selects";
export { expands } from "./expands";

/**
 * TODO: try to come up with a better error message
 * that you must import stl _before_ zod
 * in any file that uses z.openapi(),
 * including the file that calls stl.openapiSpec().
 */
extendZodWithOpenApi(z); // https://github.com/asteasolutions/zod-to-openapi#the-openapi-method

//////////////////////////////////////////////////
//////////////////////////////////////////////////
/////////////// StlMetadata //////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

declare module "zod" {
  interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
    /**
     * Adds stainless metadata properties to the def.
     */
    stlMetadata<M extends StlMetadata>(metadata: M): WithStlMetadata<this, M>;
  }
}

export const stlMetadataSymbol = Symbol("stlMetadata");

export interface StlMetadata {
  expandable?: true;
  selectable?: true;
  expands?: true;
  selects?: true;
  response?: true;
  pageResponse?: true;
  prismaModel?: any;
  from?: string;
}

export type WithStlMetadata<
  T extends z.ZodTypeAny,
  M extends StlMetadata
> = T & { _def: { [stlMetadataSymbol]: M } };

z.ZodType.prototype.stlMetadata = function stlMetadata<M extends StlMetadata>(
  this: z.ZodTypeAny,
  metadata: M
) {
  return new (this.constructor as any)({
    ...this._def,
    [stlMetadataSymbol]: { ...this._def[stlMetadataSymbol], ...metadata },
  });
};

export type ExtractStlMetadata<T extends z.ZodTypeAny> = z.ZodType<
  any,
  z.ZodTypeDef,
  any
> extends T
  ? never // bail if T is too generic, to prevent combinatorial explosion
  : T["_def"] extends {
      [stlMetadataSymbol]: infer M extends StlMetadata;
    }
  ? M
  : T extends z.ZodOptional<infer U>
  ? ExtractStlMetadata<U>
  : T extends z.ZodNullable<infer U>
  ? ExtractStlMetadata<U>
  : T extends z.ZodDefault<infer U>
  ? ExtractStlMetadata<U>
  : T extends z.ZodLazy<infer U>
  ? ExtractStlMetadata<U>
  : T extends z.ZodEffects<infer U>
  ? ExtractStlMetadata<U>
  : T extends z.ZodCatch<infer U>
  ? ExtractStlMetadata<U>
  : T extends z.ZodBranded<infer U, infer Brand>
  ? ExtractStlMetadata<U>
  : T extends z.ZodArray<infer U>
  ? ExtractStlMetadata<U>
  : T extends z.ZodPromise<infer U>
  ? ExtractStlMetadata<U>
  : T extends z.ZodSet<infer U>
  ? ExtractStlMetadata<U>
  : T extends z.ZodPipeline<infer A, infer U>
  ? ExtractStlMetadata<U>
  : never;

export function extractStlMetadata<T extends z.ZodTypeAny>(
  schema: T
): StlMetadata {
  const own = schema._def[stlMetadataSymbol];
  if (own) return own;
  if (schema instanceof z.ZodOptional) {
    return extractStlMetadata(schema.unwrap());
  }
  if (schema instanceof z.ZodNullable) {
    return extractStlMetadata(schema.unwrap());
  }
  if (schema instanceof z.ZodDefault) {
    return extractStlMetadata(schema.removeDefault());
  }
  if (schema instanceof z.ZodLazy) {
    return extractStlMetadata(schema.schema);
  }
  if (schema instanceof z.ZodEffects) {
    return extractStlMetadata(schema.innerType());
  }
  if (schema instanceof z.ZodCatch) {
    return extractStlMetadata(schema.removeCatch());
  }
  if (schema instanceof z.ZodBranded) {
    return extractStlMetadata(schema.unwrap());
  }
  if (schema instanceof z.ZodArray) {
    return extractStlMetadata(schema.element);
  }
  if (schema instanceof z.ZodPromise) {
    return extractStlMetadata(schema.unwrap());
  }
  if (schema instanceof z.ZodSet) {
    return extractStlMetadata(schema._def.valueType);
  }
  if (schema instanceof z.ZodPipeline) {
    return extractStlMetadata(schema._def.out);
  }
  return {} as any;
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
/////////////// Expandable ///////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

declare module "zod" {
  interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
    /**
     * Marks this schema as expandable via an `expand[]` query param.
     * This should only be used on object or array of object property schemas.
     */
    expandable(): ExpandableZodType<this>;
  }
}

export const expandableSymbol = Symbol("expandable");

export type ExpandableOutput<T> =
  | (NonNullable<T> & {
      readonly [expandableSymbol]: { value: T };
    })
  | null
  | undefined;

export type ExpandableInput<T> = T | null | undefined;

export type ExpandableZodType<T extends z.ZodTypeAny> = z.ZodType<
  ExpandableOutput<z.output<T>>,
  T["_def"] & { [stlMetadataSymbol]: { expandable: true } },
  ExpandableInput<z.input<T>>
>;

export type ExpandableZodArrayType<T extends z.ZodTypeAny> = z.ZodType<
  ExpandableOutput<z.output<T>[]>,
  z.ZodArrayDef & { [stlMetadataSymbol]: { expandable: true } },
  ExpandableInput<z.input<T>[]>
>;

z.ZodType.prototype.expandable = function expandable(this: z.ZodTypeAny) {
  return stlPreprocess(
    (input: StlTransformInput<any>, stlContext: StlContext<any>) => {
      const { data, path } = input;
      const expand = getExpands(stlContext);
      return expand && zodPathIsExpanded(path, expand) ? data : undefined;
    },
    this.optional()
  )
    .openapi({ effectType: "input" })
    .stlMetadata({ expandable: true });
};

function zodPathIsExpanded(
  zodPath: (string | number)[],
  expand: string[]
): boolean {
  const zodPathStr = zodPath.filter((p) => typeof p === "string").join(".");
  return expand.some((e) => e === zodPathStr || e.startsWith(`${zodPathStr}.`));
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
    ): z.ZodType<Selection<z.output<T>>, this["_def"], Selection<z.input<T>>>;

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
  T["_def"] & { [stlMetadataSymbol]: { selectable: true } },
  SelectableInput<z.input<T>>
>;

export type SelectableZodArrayType<T extends z.ZodTypeAny> = z.ZodType<
  SelectableOutput<z.output<T>[]>,
  z.ZodArrayDef & { [stlMetadataSymbol]: { selectable: true } },
  SelectableInput<z.input<T>[]>
>;

export type Selection<T> = T extends Array<infer E extends object>
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
    if (!(parent.data instanceof Object) || typeof property !== "string") {
      return z.OK(undefined);
    }
    const selectionHere = path.reduce<SelectTree | undefined>(
      (tree, elem) => (typeof elem === "number" ? tree : tree?.select?.[elem]),
      select
    )?.select;
    if (!selectionHere) return z.OK(undefined);

    const parsed = super._parse(
      Object.create(input, {
        data: { value: parent.data[property.replace(/_fields$/, "")] },
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
  if (!(this instanceof z.ZodObject)) {
    throw new Error(`.selection() must be called on a ZodObject`);
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
  return new StlSelectable(
    this.optional().stlMetadata({ selectable: true })._def
  );
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

export type StlTransformInput<Input> = z.ParseInput & {
  data: Input;
};

export type StlTransform<Input, Output> = (
  input: StlTransformInput<Input>,
  ctx: StlContext<any>
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
  if (effect[stlMetadataSymbol]?.stlPreprocess) {
    const stlContext = getStlParseContext(input.parent);
    if (!stlContext) {
      throw new Error(`missing stlContext in .stlTransform effect`);
    }
    const { ctx } = this._processInputParams(input);
    const processed = effect.transform(
      { data: ctx.data, path: ctx.path, parent: ctx },
      stlContext
    );
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
  if (effect[stlMetadataSymbol]?.stlTransform) {
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
          effect.transform(
            { data: base.value, path: input.path, parent: input.parent },
            stlContext
          )
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
      [stlMetadataSymbol]: { stlTransform: true },
    } as any,
  }) as any;
};

export type StlPreprocess = (
  input: StlTransformInput<unknown>,
  ctx: StlContext<any>
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
      [stlMetadataSymbol]: { stlPreprocess: true },
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
): WithStlMetadata<z.ZodObject<T, "strip">, { response: true }> {
  return z.object(shape, params).stlMetadata({ response: true });
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
): WithStlMetadata<
  ReturnType<PageResponseWrapper<I>["wrapped"]>,
  ExtractStlMetadata<I> & { pageResponse: true }
> {
  return response({
    ...commonPageResponseFields,
    items: z.array(item),
  }).stlMetadata({
    ...(extractStlMetadata(item) as ExtractStlMetadata<I>),
    pageResponse: true,
  });
}

export type PageData<I> = {
  items: I[];
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
};

export type PageItemType<D extends PageData<any>> = D["items"][number];

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
>;
