import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
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

declare module "zod" {
  // I don't know why TS errors without this, sigh
  interface ZodTypeDef {}

  interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
    safeParseAsync(
      data: unknown,
      params?: Partial<StlParseParams>
    ): Promise<SafeParseReturnType<Input, Output>>;

    parseAsync(
      data: unknown,
      params?: Partial<StlParseParams>
    ): Promise<Output>;

    /**
     * Marks this schema as expandable via an `expand[]` query param.
     * This should only be used on object or array of object property schemas.
     */
    expandable(): ExpandableZodType<this>;

    selection<T extends z.ZodTypeAny>(
      this: T
    ): z.ZodType<Partial<z.output<T>>, this["_def"], Partial<z.input<T>>>;

    /**
     * Marks this schema as selectable via a `select` query param.
     * This should only be used on object or array of object property schemas.
     * The property must have the name of a sibling property + `_fields`.
     */
    selectable(): SelectableZodType<this>;

    /**
     * Adds stainless metadata properties to the def.
     */
    stlMetadata<M extends StainlessMetadata>(
      metadata: M
    ): WithStainlessMetadata<this, M>;

    transform<NewOut>(
      transform: (
        arg: Output,
        ctx: StlRefinementCtx
      ) => NewOut | Promise<NewOut>
    ): z.ZodEffects<this, NewOut>;

    /**
     * Like `.transform()`, but passes the StlContext and ParseContext
     * to the transform.
     * Currently this is used to implement `.prismaModelLoader()` in the
     * Prisma plugin.
     */
    stlTransform<NewOut>(
      transform: StlTransform<Output, NewOut>
    ): z.ZodEffects<this, NewOut>;
  }
}

export const stainlessMetadata = Symbol("stainlessMetadata");

export interface StainlessMetadata {
  expandable?: true;
  selectable?: true;
  response?: true;
  pageResponse?: true;
  prismaModel?: any;
}

export const expandableSymbol = Symbol("expandable");

export type Expandable<T> =
  | (NonNullable<T> & {
      readonly [expandableSymbol]?: { value: T };
    })
  | null
  | undefined;

export const selectableSymbol = Symbol("selectable");

export type Selectable<T> =
  | (Partial<NonNullable<T>> & {
      readonly [selectableSymbol]?: { value: T };
    })
  | null
  | undefined;

type ExpandableZodType<T extends z.ZodTypeAny> = z.ZodType<
  Expandable<z.output<T>>,
  T["_def"] & { [stainlessMetadata]: { expandable: true } },
  Expandable<z.input<T>>
>;

type SelectableZodType<T extends z.ZodTypeAny> = z.ZodType<
  Selectable<z.output<T>>,
  T["_def"] & { [stainlessMetadata]: { selectable: true } },
  Selectable<z.input<T>>
>;

export type WithStainlessMetadata<
  T extends z.ZodTypeAny,
  M extends StainlessMetadata
> = T & { _def: { [stainlessMetadata]: M } };

export function getStainlessMetadata<T extends z.ZodTypeAny>(
  schema: T
): ExtractStainlessMetadata<T> {
  return schema._def[stainlessMetadata] || {};
}

export type ExtractStainlessMetadata<T extends z.ZodTypeAny> =
  T["_def"] extends { [stainlessMetadata]: infer M extends StainlessMetadata }
    ? M
    : StainlessMetadata;

export type StlTransform<Output, NewOut> = (
  arg: Output,
  ctx: StlContext<any>,
  parseContext: ParseContext
) => NewOut | Promise<NewOut>;

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

function zodPathIsExpanded(
  zodPath: (string | number)[],
  expand: string[]
): boolean {
  const zodPathStr = zodPath.filter((p) => typeof p === "string").join(".");
  return expand.some((e) => e === zodPathStr || e.startsWith(`${zodPathStr}.`));
}

let extended = false;

export function extendZodForStl(zod: typeof z) {
  if (extended) return;
  extended = true;

  /**
   * TODO: try to come up with a better error message
   * that you must import stl _before_ zod
   * in any file that uses z.openapi(),
   * including the file that calls stl.openapiSpec().
   */
  extendZodWithOpenApi(zod); // https://github.com/asteasolutions/zod-to-openapi#the-openapi-method

  function handleParseReturn<I, O>(
    result: z.ParseReturnType<I>,
    handle: (result: z.SyncParseReturnType<I>) => z.SyncParseReturnType<O>
  ): z.ParseReturnType<O> {
    return zod.isAsync(result) ? result.then(handle) : handle(result);
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
            return zod.DIRTY(convert(result.value));
          case "valid":
            return zod.OK(convert(result.value));
        }
      }
    );
  }

  zod.ZodType.prototype.safeParseAsync = async function safeParseAsync(
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
      parsedType: zod.getParsedType(data),
    };

    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (zod.isAsync(maybeAsyncResult)
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
    if (zod.isValid(result)) {
      return { success: true, data: result.value };
    } else {
      if (!ctx.common.issues.length) {
        throw new Error("Validation failed but no issues detected.");
      }

      return {
        success: false,
        get error() {
          if ((this as any)._error) return (this as any)._error as Error;
          const error = new zod.ZodError(ctx.common.issues);
          (this as any)._error = error;
          return (this as any)._error;
        },
      };
    }
  };

  const zodEffectsSuperParse = zod.ZodEffects.prototype._parse;
  zod.ZodEffects.prototype._parse = function _parse(
    input: z.ParseInput
  ): z.ParseReturnType<any> {
    const effect: any = this._def.effect || null;
    if (effect.type === "stlTransform") {
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
            effect.transform(base.value, stlContext, input.parent)
          ).then((result) => ({ status: status.value, value: result }));
        });
    }
    return zodEffectsSuperParse.call(this, input);
  };

  zod.ZodType.prototype.stlTransform = function stlTransform(
    this: z.ZodTypeAny,
    transform: StlTransform<any, any>
  ) {
    return new z.ZodEffects({
      description: this._def.description,
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "stlTransform", transform } as any,
    }) as any;
  };

  class StlExpandable<T extends z.ZodTypeAny> extends zod.ZodOptional<T> {
    _parse(input: z.ParseInput): z.ParseReturnType<this["_output"]> {
      const ctx = getStlParseContext(input.parent);
      const expand = ctx ? getExpands(ctx) : undefined;

      if (!expand || !zodPathIsExpanded(input.path, expand)) {
        return z.OK(undefined);
      }
      return super._parse(input);
    }
  }

  zod.ZodType.prototype.expandable = function expandable(this: z.ZodTypeAny) {
    return new StlExpandable(
      this.optional().stlMetadata({ expandable: true })._def
    );
  };

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
  class StlSelectable<T extends z.ZodTypeAny> extends zod.ZodOptional<T> {
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
        (tree, elem) =>
          typeof elem === "number" ? tree : tree?.select?.[elem],
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

  zod.ZodType.prototype.selection = function selection(this: z.ZodTypeAny) {
    if (!(this instanceof zod.ZodObject)) {
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

  zod.ZodType.prototype.selectable = function selectable(this: z.ZodTypeAny) {
    return new StlSelectable(
      this.optional().stlMetadata({ selectable: true })._def
    );
  };

  const zodObjectSuperParse = zod.ZodObject.prototype._parse;
  zod.ZodObject.prototype._parse = function _parse<T>(
    input: z.ParseInput
  ): z.ParseReturnType<T> {
    const { path } = input;
    const expand: string[] | undefined = getStlParseContext(input.parent)
      ?.parsedParams?.query?.expand;

    const parsed = zodObjectSuperParse.call(this, input);
    // @ts-expect-error only expandable (optional) props are getting omitted
    return convertParseReturn(
      parsed,
      omitBy(
        (v, key) =>
          (getStainlessMetadata(this.shape[key]) as any).expandable &&
          expand &&
          !zodPathIsExpanded([...path, key], expand)
      )
    );
  };

  zod.ZodType.prototype.stlMetadata = function stlMetadata<
    M extends StainlessMetadata
  >(this: z.ZodTypeAny, metadata: M) {
    return new (this.constructor as any)({
      ...this._def,
      [stainlessMetadata]: { ...this._def[stainlessMetadata], ...metadata },
    });
  };
}
