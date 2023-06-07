import {
  AnyEndpoint,
  MakeStainlessPlugin,
  Params,
  PartialStlContext,
  StlContext,
  SelectTree,
  NotFoundError,
  z,
} from "stainless";
import {
  expandsOptions,
  expandSubPaths,
  addExpandParents,
} from "./expandsUtils";
import { isPlainObject } from "lodash";

declare module "zod" {
  interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
    /**
     * Transforms the output value to fetch the Prisma model whose primary
     * key is the input value.  Throws if the primary key wasn't found.
     * This should only be used on path or body params; the Prisma model
     * is determined by the `prismaModel` passed to `stl.response` or
     * `z.pageResponse`.
     */
    prismaModelLoader<M extends PrismaModel>(
      prismaModel: M
    ): z.ZodEffects<this, FindUniqueOrThrowResult<M>, z.input<this>>;

    prismaModel<M extends PrismaModel>(
      prismaModel: M
    ): z.WithStlMetadata<this, { prismaModel: M }>;
  }
}

declare module "stainless" {
  interface StlContext<EC extends AnyEndpoint> {
    prisma: z.ExtractStlMetadata<EC["response"]> extends {
      prismaModel: infer M extends PrismaModel;
    }
      ? PrismaContext<M>
      : unknown;
  }
}

z.ZodType.prototype.prismaModelLoader = function prismaModelLoader<
  T extends z.ZodTypeAny,
  M extends PrismaModel
>(
  this: T,
  prismaModel: M
): z.ZodEffects<T, FindUniqueOrThrowResult<M>, z.input<T>> {
  const result = this.stlTransform(
    async (input: z.StlTransformInput<z.output<T>>, ctx: StlContext<any>) => {
      const id = input.data;
      const query = { where: { id } };
      const prisma: PrismaContext<any> = (ctx as any).prisma;
      if (prisma && prismaModel === prisma.prismaModel) {
        return await prisma.findUniqueOrThrow(query);
      }
      return await prismaModel.findUniqueOrThrow(query);
    }
  );
  // tsc -b is generating spurious errors here...
  return (result as any).openapi({ effectType: "input" }) as typeof result;
};

z.ZodType.prototype.prismaModel = function prismaModel<
  T extends z.ZodTypeAny,
  M extends PrismaModel
>(this: T, prismaModel: M): z.WithStlMetadata<T, { prismaModel: M }> {
  return this.stlMetadata({ prismaModel });
};

export type PrismaContext<M extends PrismaModel> = {
  /**
   * The `prismaModel` passed to `stl.response` or
   * `z.pageResponse`.
   */
  prismaModel: M;
  /**
   * Injects query options from `expand`, `select`, and pagination
   * params into the given Prisma query options for the response
   * `prismaModel`.
   */
  wrapQuery: <Q extends { include?: any }>(query: Q) => Q;
  /**
   * Shortcut for `findUnique` on the response `prismaModel` with
   * injected options from `expand`, `select`, and pagination params.
   */
  findUnique: FindUnique<M>;
  /**
   * Shortcut for `findUniqueOrThrow` on the response `prismaModel` with
   * injected options from `expand`, `select`, and pagination params.
   */
  findUniqueOrThrow: FindUniqueOrThrow<M>;
  /**
   * Shortcut for `findMany` on the response `prismaModel` with
   * injected options from `expand`, `select`, and pagination params.
   */
  findMany: FindMany<M>;
  /**
   * Shortcut for `create` on the response `prismaModel` with
   * injected options from `expand` and `select` params.
   */
  create: Create<M>;
  /**
   * Shortcut for `update` on the response `prismaModel` with
   * injected options from `expand` and `select` params.
   */
  update: Update<M>;
  /**
   * Shortcut for `delete` on the response `prismaModel` with
   * injected options from `expand` and `select` params.
   */
  delete: Delete<M>;
  /**
   * Fetches items from the database for the given Prisma query
   * options and `expand`, `select`, and pagination params, and
   * returns a page response.
   */
  paginate: (args: FindManyArgs<M>) => Promise<z.PageData<FindManyItem<M>>>;
};

export type PrismaStatics = {
  pagination: {
    wrapQuery: typeof wrapQuery;
    makeResponse: typeof makeResponse;
  };
  paginate: typeof paginate;
  expandToInclude: typeof expandToInclude;
};
function stringifyCursor(values: any): string | undefined {
  if (values == null) return undefined;
  return Buffer.from(JSON.stringify(values)).toString("base64");
}

function parseCursor(cursor: string): any {
  return JSON.parse(Buffer.from(cursor, "base64").toString());
}

function wrapQuery<Q>(
  {
    pageAfter,
    pageBefore,
    pageSize,
    sortBy,
    sortDirection = "asc",
  }: z.PaginationParams,
  query: Q
): Q {
  const cursorString = pageAfter ?? pageBefore;
  const cursor =
    cursorString != null ? { [sortBy]: parseCursor(cursorString) } : undefined;
  return {
    ...query,
    cursor,
    skip: 1,
    take: pageSize + 1,
    orderBy: { [sortBy]: sortDirection },
  };
}

function makeResponse<I>(
  params: z.PaginationParams,
  items: I[]
): z.PageData<I> {
  const { pageAfter, pageBefore, pageSize, sortBy } = params;
  const start = items[0];
  const end = items[Math.min(items.length, pageSize) - 1];
  return {
    items: items.slice(0, pageSize),
    // @ts-expect-error TODO
    startCursor: stringifyCursor(start?.[sortBy]) ?? null,
    // @ts-expect-error TODO
    endCursor: stringifyCursor(end?.[sortBy]) ?? null,
    hasPreviousPage: pageBefore != null ? items.length > pageSize : undefined,
    hasNextPage:
      pageAfter != null || pageBefore == null
        ? items.length > pageSize
        : undefined,
  };
}

interface PrismaModel {
  findUnique(args: any): Promise<any>;
  findUniqueOrThrow(args: any): Promise<any>;
  findMany(args: any): Promise<any>;
  create(args: any): Promise<any>;
  update(args: any): Promise<any>;
  delete(args: any): Promise<any>;
}

type FindUnique<D extends PrismaModel> = D extends {
  findUnique: infer Fn extends (args: any) => any;
}
  ? Fn
  : never;

type FindUniqueOrThrow<D extends PrismaModel> = D extends {
  findUniqueOrThrow: infer Fn extends (args: any) => any;
}
  ? Fn
  : never;

type FindUniqueOrThrowResult<D extends PrismaModel> = D extends {
  findUniqueOrThrow: (args: any) => Promise<infer Result>;
}
  ? Result
  : never;

type FindMany<D extends PrismaModel> = D extends {
  findMany: infer Fn extends (args: any) => any;
}
  ? Fn
  : never;

type Create<D extends PrismaModel> = D extends {
  create: infer Fn extends (args: any) => any;
}
  ? Fn
  : never;

type Update<D extends PrismaModel> = D extends {
  update: infer Fn extends (args: any) => any;
}
  ? Fn
  : never;

type Delete<D extends PrismaModel> = D extends {
  delete: infer Fn extends (args: any) => any;
}
  ? Fn
  : never;

type FindManyArgs<D extends PrismaModel> = D extends {
  findMany(args: infer Args): any;
}
  ? Args
  : never;

type FindManyItem<D extends PrismaModel> = D extends {
  findMany(args: any): Promise<Array<infer Item>>;
}
  ? Item
  : never;

async function paginate<D extends PrismaModel>(
  delegate: D,
  {
    pageAfter,
    pageBefore,
    pageSize,
    sortBy,
    sortDirection,
    ...query
  }: FindManyArgs<D> & z.PaginationParams
): Promise<z.PageData<FindManyItem<D>>> {
  const params = {
    pageAfter,
    pageBefore,
    pageSize,
    sortBy,
    sortDirection,
  };
  return makeResponse(
    params,
    await delegate.findMany(wrapQuery(params, query))
  );
}

function endpointWrapQuery<EC extends AnyEndpoint, Q extends { include?: any }>(
  endpoint: EC,
  context: PartialStlContext<any, EC>,
  prismaQuery: Q
): Q {
  const { response } = endpoint;
  const includeSelect = createIncludeSelect(endpoint, context, prismaQuery);

  if (z.extractStlMetadata(response)?.pageResponse) {
    const { pageAfter, pageBefore, pageSize, sortBy, sortDirection } =
      context.parsedParams?.query || {};
    const cursorString = pageAfter ?? pageBefore;
    const cursor =
      cursorString != null
        ? { [sortBy]: parseCursor(cursorString) }
        : undefined;

    return {
      ...prismaQuery,
      ...includeSelect,
      cursor,
      skip: 1,
      take: pageSize + 1,
      orderBy: { [sortBy]: sortDirection },
    };
  }
  return {
    ...prismaQuery,
    ...includeSelect,
  };
}

type IncludeSelect = {
  include?: Record<string, boolean | IncludeSelect> | null;
  select?: Record<string, boolean | IncludeSelect> | null;
};

type AnySelect = Record<string, boolean | { select?: AnySelect }>;
type AnyInclude = Record<
  string,
  boolean | { include?: AnyInclude; select?: AnySelect }
>;

function createIncludeSelect<
  EC extends AnyEndpoint,
  Q extends { include?: any }
>(
  endpoint: EC,
  context: PartialStlContext<any, EC>,
  prismaQuery: Q
): IncludeSelect | null | undefined {
  const queryShape = endpoint.query?.shape;
  const expandSchema = queryShape?.expand;
  const userInclude = prismaQuery?.include;
  let select: SelectTree | null | undefined = queryShape?.select
    ? context.parsedParams?.query?.select
    : undefined;
  if (select != null && !isPlainObject(select)) {
    throw new Error(`invalid select query param`);
  }
  let expand = context.parsedParams?.query?.expand;
  if (
    expand != null &&
    (!Array.isArray(expand) || expand.some((e) => typeof e !== "string"))
  ) {
    throw new Error(`invalid expand query param`);
  }
  const isPage = z.extractStlMetadata(endpoint.response).pageResponse;
  if (isPage) {
    expand = expand ? expandSubPaths(expand, "items") : undefined;
    select = select?.select?.items;
  }
  const include =
    userInclude && expandSchema
      ? removeUnexpandedIncludes(
          userInclude,
          expandsOptions(expandSchema),
          addExpandParents(expand || [])
        )
      : userInclude;
  let result: IncludeSelect | null | undefined = { include };
  if (expand) {
    result = mergeIncludeSelect(result, {
      include: expandToInclude(expand) as AnyInclude,
    });
  }
  const convertedSelect = select ? convertSelect(select) : undefined;
  if (convertedSelect instanceof Object) {
    result = mergeIncludeSelect(result, { include: convertedSelect });
  }
  return result;
}

function removeUnexpandedIncludes(
  include: AnyInclude,
  possibleExpands: string[],
  expand: Set<string>,
  path: string[] = []
): AnyInclude {
  const result: AnyInclude = {};
  for (const key in include) {
    const value = include[key];
    const keyPath = [...path, key];
    const keyPathStr = keyPath.join(".");
    if (!possibleExpands.includes(keyPathStr) || expand.has(keyPathStr)) {
      result[key] =
        value instanceof Object && value.include
          ? removeUnexpandedIncludes(
              value.include,
              possibleExpands,
              expand,
              keyPath
            )
          : value;
    }
  }
  return result;
}

function mergeIncludeSelect(
  a: IncludeSelect | null | undefined,
  b: IncludeSelect | null | undefined
): IncludeSelect | null | undefined {
  const result = mergeIncludeSelectSub(a, b);
  return typeof result === "boolean" ? undefined : result;
}

function mergeIncludeSelectSub(
  a: IncludeSelect | null | undefined | boolean,
  b: IncludeSelect | null | undefined | boolean
): IncludeSelect | null | undefined | boolean {
  if (!a) return b;
  if (!b) return a;
  const { include: ainc, select: asel } =
    a instanceof Object ? a : ({} as IncludeSelect);
  const { include: binc, select: bsel } =
    b instanceof Object ? b : ({} as IncludeSelect);
  if (ainc && asel) {
    throw new Error(`can't provide both include and select`);
  }
  if (binc && bsel) {
    throw new Error(`can't provide both include and select`);
  }
  const incKeys = [...Object.keys(ainc || {}), ...Object.keys(binc || {})];
  const mustInclude = incKeys.length || a === true || b === true;
  if (mustInclude) {
    incKeys.push(...subselKeys(asel), ...subselKeys(bsel));
  }
  const selKeys = [...Object.keys(asel || {}), ...Object.keys(bsel || {})];

  const aobj = asel || ainc || ({} as Record<string, boolean | IncludeSelect>);
  const bobj = bsel || binc || ({} as Record<string, boolean | IncludeSelect>);

  const merged: Record<string, boolean | IncludeSelect> = {};
  if (mustInclude) {
    for (const key of incKeys) {
      const value = mergeIncludeSelectSub(aobj[key], bobj[key]);
      if (value != null) merged[key] = value;
    }
    return Object.keys(merged).length ? { include: merged } : true;
  }

  for (const key of selKeys) {
    const value = mergeIncludeSelectSub(aobj[key], bobj[key]);
    if (value != null) merged[key] = value;
  }
  return Object.keys(merged).length ? { select: merged } : null;
}

function* subselKeys(select: IncludeSelect["select"]): Iterable<string> {
  if (!select) return;
  for (const key of Object.keys(select)) {
    const value = select[key];
    if (value instanceof Object && (value.select || value.include)) yield key;
  }
}

export const makePrismaPlugin =
  (): MakeStainlessPlugin<any, PrismaStatics> => (stl) => {
    return {
      statics: {
        pagination: {
          wrapQuery,
          makeResponse,
        },
        paginate: paginate,
        expandToInclude: expandToInclude,
      },
      middleware<EC extends AnyEndpoint>(
        endpoint: EC,
        params: Params,
        context: PartialStlContext<any, EC>
      ) {
        const model = (
          endpoint.response ? z.extractStlMetadata(endpoint.response) : null
        )?.prismaModel;
        function getModel(): PrismaModel {
          if (!model)
            throw new Error(`response doesn't have a prisma model configured`);
          return model;
        }
        function wrapQuery<Q extends { include?: any }>(prismaQuery: Q): Q {
          return endpointWrapQuery(endpoint, context, prismaQuery);
        }

        const prismaContext: PrismaContext<PrismaModel> = {
          prismaModel: model,
          wrapQuery,
          findUnique: (args) => getModel().findUnique(wrapQuery(args)),
          findUniqueOrThrow: (args) =>
            getModel()
              .findUniqueOrThrow(wrapQuery(args))
              .catch((e) => {
                console.error(e.stack);
                throw new NotFoundError();
              }),
          findMany: (args) => getModel().findMany(wrapQuery(args)),
          create: (args) => getModel().create(wrapQuery(args)),
          update: (args) => getModel().update(wrapQuery(args)),
          delete: (args) => getModel().delete(wrapQuery(args)),
          async paginate(args: FindManyArgs<any>): Promise<z.PageData<any>> {
            const query = context.parsedParams?.query || {};
            return makeResponse(query, await prismaContext.findMany(args));
          },
        };
        context.prisma = prismaContext as any;
      },
    };
  };

type TopLevel<E extends string> = E extends `${infer A}.${string}` ? A : E;
type NextLevel<
  E extends string,
  Prefix extends string
> = E extends `${Prefix}.${infer B}` ? B : never;

type ExpandToInclude<T extends string> = {
  [K in TopLevel<T>]?:
    | boolean
    | (NextLevel<T, K> extends string
        ? { include: ExpandToInclude<NextLevel<T, K>> }
        : never);
};

function expandToInclude<T extends string[]>(
  expand: T
): ExpandToInclude<T[number]> {
  const result: any = {};
  for (const path of expand) {
    const parts = path.split(".");
    let include = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(include[parts[i]] instanceof Object)) {
        const next = { include: {} };
        include[parts[i]] = next;
        include = next.include;
      }
    }
    include[parts[parts.length - 1]] = true;
  }
  return result;
}

type PrismaSelect = Record<string, boolean | { select: PrismaSelect }>;

function convertSelect(
  tree: SelectTree | undefined
): PrismaSelect | true | undefined {
  const select = tree?.select;
  if (!select) return tree instanceof Object ? true : undefined;
  const result: PrismaSelect = {};
  for (let key of Object.keys(select)) {
    const converted = convertSelect(select[key]);
    key = key.replace(/_fields$/, "");
    if (converted instanceof Object) result[key] = { select: converted };
    else if (converted === true) result[key] = converted;
  }
  return result;
}
