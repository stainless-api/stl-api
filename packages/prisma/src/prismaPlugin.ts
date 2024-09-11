import {
  AnyEndpoint,
  AnyBaseEndpoint,
  MakeStainlessPlugin,
  Params,
  StlContext,
  SelectTree,
  NotFoundError,
  z,
} from "stainless";
import { includeSubPaths } from "./includeUtils";
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
    prismaModelLoader<M extends PrismaHelpers>(
      prismaModel: M | (() => M),
    ): z.ZodEffects<this, FindUniqueOrThrowResult<M>, z.input<this>>;

    prismaModel<M extends PrismaHelpers>(
      prismaModel: M | (() => M),
    ): z.ZodMetadata<this, { stainless: { prismaModel: () => M } }>;
  }
}

export type extractPrismaModel<T extends z.ZodTypeAny> =
  z.extractDeepMetadata<
    T,
    { stainless: { prismaModel: () => PrismaHelpers } }
  > extends { stainless: { prismaModel: () => infer P extends PrismaHelpers } }
    ? P
    : never;

export function extractPrismaModel<T extends z.ZodTypeAny>(
  schema: T,
): extractPrismaModel<T> {
  const metadata = z.extractDeepMetadata(schema, {
    stainless: { prismaModel: () => {} },
  });
  if (metadata) {
    return (metadata as any)?.stainless?.prismaModel();
  }
  return undefined as never;
}

declare module "stainless" {
  interface StlContext<EC extends AnyBaseEndpoint> {
    prisma: extractPrismaModel<EC["response"]> extends infer M extends
      PrismaHelpers
      ? PrismaContext<M>
      : unknown;
  }
}

z.ZodType.prototype.prismaModelLoader = function prismaModelLoader<
  T extends z.ZodTypeAny,
  M extends PrismaHelpers,
>(
  this: T,
  prismaModel: M | (() => M),
): z.ZodEffects<T, FindUniqueOrThrowResult<M>, z.input<T>> {
  const result = this.stlTransform(
    async (id: z.output<T>, ctx: StlContext<any>, zodInput: z.ParseInput) => {
      const query = { where: { id } };
      const prisma: PrismaContext<any> = (ctx as any).prisma;
      const model =
        prismaModel instanceof Function ? prismaModel() : prismaModel;
      if (prisma && model === prisma.prismaModel) {
        return await prisma.findUniqueOrThrow(query);
      }
      return await model.findUniqueOrThrow(query);
    },
  );
  // tsc -b is generating spurious errors here...
  return (result as any).openapi({ effectType: "input" }) as typeof result;
};

z.ZodType.prototype.prismaModel = function prismaModel<
  T extends z.ZodTypeAny,
  M extends PrismaHelpers,
>(
  this: T,
  prismaModel: M | (() => M),
): z.ZodMetadata<T, { stainless: { prismaModel: () => M } }> {
  return this.withMetadata({
    stainless: {
      prismaModel:
        prismaModel instanceof Function ? prismaModel : () => prismaModel,
    },
  });
};

export type PrismaContext<M extends PrismaHelpers> = {
  /**
   * The `prismaModel` passed to `stl.response` or
   * `z.pageResponse`.
   */
  prismaModel: M;
  /**
   * Injects query options from `include`, `select`, and pagination
   * params into the given Prisma query options for the response
   * `prismaModel`.
   */
  wrapQuery: <Q extends { include?: any }>(query: Q) => Q;
  /**
   * Shortcut for `findUnique` on the response `prismaModel` with
   * injected options from `include`, `select`, and pagination params.
   */
  findUnique: FindUnique<M>;
  /**
   * Shortcut for `findUniqueOrThrow` on the response `prismaModel` with
   * injected options from `include`, `select`, and pagination params.
   */
  findUniqueOrThrow: FindUniqueOrThrow<M>;
  /**
   * Shortcut for `findMany` on the response `prismaModel` with
   * injected options from `include`, `select`, and pagination params.
   */
  findMany: FindMany<M>;
  /**
   * Shortcut for `create` on the response `prismaModel` with
   * injected options from `include` and `select` params.
   */
  create: Create<M>;
  /**
   * Shortcut for `update` on the response `prismaModel` with
   * injected options from `include` and `select` params.
   */
  update: Update<M>;
  /**
   * Shortcut for `delete` on the response `prismaModel` with
   * injected options from `include` and `select` params.
   */
  delete: Delete<M>;
  /**
   * Fetches items from the database for the given Prisma query
   * options and `include`, `select`, and pagination params, and
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
  query: Q,
): Q {
  const cursorString = pageAfter ?? pageBefore;
  const cursor =
    cursorString != null ? { [sortBy]: parseCursor(cursorString) } : undefined;
  return {
    ...query,
    cursor,
    skip: cursor ? 1 : 0,
    take: pageSize + 1,
    orderBy: {
      [sortBy]: pageBefore
        ? sortDirection === "desc"
          ? "asc"
          : "desc"
        : sortDirection,
    },
  };
}

function makeResponse<I>(
  params: z.PaginationParams,
  items: I[],
): z.PageData<I> {
  const { pageAfter, pageBefore, pageSize, sortBy } = params;
  const itemCount = items.length;
  items = items.slice(0, pageSize);
  if (pageBefore) items.reverse();
  const start = items[0];
  const end = items[items.length - 1];
  return {
    items,
    // @ts-expect-error TODO
    startCursor: stringifyCursor(start?.[sortBy]) ?? null,
    // @ts-expect-error TODO
    endCursor: stringifyCursor(end?.[sortBy]) ?? null,
    hasPreviousPage: pageBefore != null ? itemCount > pageSize : undefined,
    hasNextPage:
      pageAfter != null || pageBefore == null
        ? itemCount > pageSize
        : undefined,
  };
}

interface PrismaHelpers {
  findUnique(args: any): Promise<any>;
  findUniqueOrThrow(args: any): Promise<any>;
  findMany(args: any): Promise<any>;
  create(args: any): Promise<any>;
  update(args: any): Promise<any>;
  delete(args: any): Promise<any>;
}

type FindUnique<D extends PrismaHelpers> = D extends {
  findUnique: infer Fn extends (args: any) => any;
}
  ? Fn
  : never;

type FindUniqueOrThrow<D extends PrismaHelpers> = D extends {
  findUniqueOrThrow: infer Fn extends (args: any) => any;
}
  ? Fn
  : never;

type FindUniqueOrThrowResult<D extends PrismaHelpers> = D extends {
  findUniqueOrThrow: (args: any) => Promise<infer Result>;
}
  ? Result
  : never;

type FindMany<D extends PrismaHelpers> = D extends {
  findMany: infer Fn extends (args: any) => any;
}
  ? Fn
  : never;

type Create<D extends PrismaHelpers> = D extends {
  create: infer Fn extends (args: any) => any;
}
  ? Fn
  : never;

type Update<D extends PrismaHelpers> = D extends {
  update: infer Fn extends (args: any) => any;
}
  ? Fn
  : never;

type Delete<D extends PrismaHelpers> = D extends {
  delete: infer Fn extends (args: any) => any;
}
  ? Fn
  : never;

type FindManyArgs<D extends PrismaHelpers> = D extends {
  findMany(args: infer Args): any;
}
  ? Args
  : never;

type FindManyItem<D extends PrismaHelpers> = D extends {
  findMany(args: any): Promise<Array<infer Item>>;
}
  ? Item
  : never;

async function paginate<D extends PrismaHelpers>(
  delegate: D,
  {
    pageAfter,
    pageBefore,
    pageSize,
    sortBy,
    sortDirection,
    ...query
  }: FindManyArgs<D> & z.PaginationParams,
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
    await delegate.findMany(wrapQuery(params, query)),
  );
}

function endpointWrapQuery<
  EC extends AnyBaseEndpoint,
  Q extends { include?: any },
>(endpoint: EC, context: StlContext<EC>, prismaQuery: Q): Q {
  const { response } = endpoint;
  const includeSelect = createIncludeSelect(endpoint, context, prismaQuery);

  if (z.isPageResponse(response)) {
    return {
      ...wrapQuery(context.parsedParams?.query || {}, prismaQuery),
      ...includeSelect,
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
  EC extends AnyBaseEndpoint,
  Q extends { include?: any },
>(
  endpoint: EC,
  context: StlContext<EC>,
  prismaQuery: Q,
): IncludeSelect | null | undefined {
  const callerInclude = prismaQuery?.include;
  let select: SelectTree | null | undefined = z.getSelects(context);
  if (select != null && !isPlainObject(select)) {
    throw new Error(`invalid select query param`);
  }
  let include = z.getIncludes(context);
  if (
    include != null &&
    (!Array.isArray(include) || include.some((e) => typeof e !== "string"))
  ) {
    throw new Error(`invalid include query param`);
  }
  if (z.isPageResponse(endpoint.response)) {
    include = include ? includeSubPaths(include, "items") : undefined;
    select = select?.select?.items;
  }
  let result: IncludeSelect | null | undefined = { include: callerInclude };
  if (include) {
    result = mergeIncludeSelect(result, {
      include: includeFromQuery(include) as AnyInclude,
    });
  }
  const convertedSelect = select ? convertSelect(select) : undefined;
  if (convertedSelect instanceof Object) {
    result = mergeIncludeSelect(result, { include: convertedSelect });
  }
  return result;
}

function mergeIncludeSelect(
  a: IncludeSelect | null | undefined,
  b: IncludeSelect | null | undefined,
): IncludeSelect | null | undefined {
  const result = mergeIncludeSelectSub(a, b);
  return typeof result === "boolean" ? undefined : result;
}

function mergeIncludeSelectSub(
  a: IncludeSelect | null | undefined | boolean,
  b: IncludeSelect | null | undefined | boolean,
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
  (): MakeStainlessPlugin<PrismaStatics> => (stl) => {
    return {
      statics: {
        pagination: {
          wrapQuery,
          makeResponse,
        },
        paginate: paginate,
      },
      middleware<EC extends AnyEndpoint>(
        params: Params,
        context: StlContext<EC>,
      ) {
        const model = context.endpoint.response
          ? (extractPrismaModel(context.endpoint.response) as any)
          : null;
        function getModel(): PrismaHelpers {
          if (!model)
            throw new Error(`response doesn't have a prisma model configured`);
          return model;
        }
        function wrapQuery<Q extends { include?: any }>(prismaQuery: Q): Q {
          return endpointWrapQuery(context.endpoint, context, prismaQuery);
        }

        const prismaContext: PrismaContext<PrismaHelpers> = {
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
  Prefix extends string,
> = E extends `${Prefix}.${infer B}` ? B : never;

type includeFromQuery<T extends string> = {
  [K in TopLevel<T>]?:
    | boolean
    | (NextLevel<T, K> extends string
        ? { include: includeFromQuery<NextLevel<T, K>> }
        : never);
};

/**
 * Converts an include parameter from stainless format
 * e.g. `['user.comments', 'comments.user'] to prisma
 * include format e.g.
 * {
 *   user: { include: { comments: true } },
 *   comments: { include: { user: true } },
 * }
 */
function includeFromQuery<T extends string[]>(
  include: T,
): includeFromQuery<T[number]> {
  const result: any = {};
  for (const path of include) {
    const parts = path.split(".");
    let prismaInclude = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(prismaInclude[parts[i]] instanceof Object)) {
        const next = { include: {} };
        prismaInclude[parts[i]] = next;
        prismaInclude = next.include;
      }
    }
    prismaInclude[parts[parts.length - 1]] = true;
  }
  return result;
}

type PrismaSelect = Record<string, boolean | { select: PrismaSelect }>;

function convertSelect(
  tree: SelectTree | undefined,
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

export const PrismaModelSymbol = Symbol("PrismaModel");

type MakePrismaModelMetadata<M> = { stainless: { prismaModel: () => M } };

export abstract class PrismaModel<O> extends z.Schema<O> {
  declare [PrismaModelSymbol]: true;
  declare abstract model: PrismaHelpers;
  declare metadata: MakePrismaModelMetadata<this["model"]>;
}

export const PrismaModelLoaderSymbol = Symbol("PrismaModelLoader");

export abstract class PrismaModelLoader<O, I> extends z.Schema<O, I> {
  declare [PrismaModelLoaderSymbol]: true;
  declare [z.EffectsSymbol]: true;
  declare abstract model:
    | {
        findUniqueOrThrow(args: any): Promise<O>;
      }
    | (() => {
        findUniqueOrThrow(args: any): Promise<O>;
      });
  async transform(id: z.Out<I>, ctx: StlContext<any>): Promise<z.Out<O>> {
    const query = { where: { id } };
    const prisma: PrismaContext<any> = (ctx as any).prisma;
    const model = typeof this.model === "function" ? this.model() : this.model;
    if (prisma && model === prisma.prismaModel) {
      return await prisma.findUniqueOrThrow(query);
    }
    return (await model.findUniqueOrThrow(query)) as any;
  }
}
