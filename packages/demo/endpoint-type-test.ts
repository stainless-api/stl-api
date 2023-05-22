import z from "zod";

/**
 * Ensures that the input and output types are both
 * objects; plays well with z.object(...).transform(() => ({...}))
 * whereas z.AnyZodObject doesn't.
 */
type ZodObjectSchema = z.ZodType<object, any, object>;

type Handler<
  Ctx,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response
> = (
  request: MakeRequest<Path, Query, Body>,
  ctx: Ctx
) => Response | Promise<Response>;

type MakeRequest<
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined
> = (Path extends z.ZodTypeAny ? z.infer<Path> : {}) &
  (Query extends z.ZodTypeAny ? z.infer<Query> : {}) &
  (Body extends z.ZodTypeAny ? z.infer<Body> : {});

type EndpointConfig<
  Ctx,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response extends z.ZodTypeAny | undefined
> = {
  path: Path;
  query: Query;
  body: Body;
  response: Response;
  handler: Handler<
    Ctx,
    Path,
    Query,
    Body,
    Response extends z.ZodTypeAny ? z.input<Response> : undefined
  >;
};

function endpoint<
  Ctx,
  Path extends ZodObjectSchema | undefined,
  Query extends ZodObjectSchema | undefined,
  Body extends ZodObjectSchema | undefined,
  Response extends z.ZodTypeAny = z.ZodVoid
>({
  path,
  query,
  body,
  response,
  ...rest
}: {
  path?: Path;
  query?: Query;
  body?: Body;
  response?: Response;
  handler: Handler<
    Ctx,
    Path,
    Query,
    Body,
    Response extends z.ZodTypeAny ? z.input<Response> : undefined
  >;
}): EndpointConfig<Ctx, Path, Query, Body, Response> {
  return {
    path: path as Path,
    query: query as Query,
    body: body as Body,
    response: (response || z.void()) as Response,
    ...rest,
  };
}

type AnyEndpointConfig = EndpointConfig<any, any, any, any, any>;

type ValueOf<T extends object> = T[keyof T];

type ExtractClientPath<E extends AnyEndpointConfig> =
  E["path"] extends z.ZodTypeAny ? ValueOf<z.input<E["path"]>> : undefined;
type ExtractClientQuery<E extends AnyEndpointConfig> =
  E["query"] extends z.ZodTypeAny ? z.input<E["query"]> : undefined;
type ExtractClientBody<E extends AnyEndpointConfig> =
  E["body"] extends z.ZodTypeAny ? z.input<E["body"]> : undefined;
type ExtractClientResponse<E extends AnyEndpointConfig> =
  E["response"] extends z.ZodTypeAny ? z.infer<E["response"]> : undefined;

type ClientFunction<E extends AnyEndpointConfig> =
  E["path"] extends z.ZodTypeAny
    ? E["body"] extends z.ZodTypeAny
      ? (
          path: ExtractClientPath<E>,
          body: ExtractClientBody<E>,
          options?: { query?: ExtractClientQuery<E> }
        ) => Promise<ExtractClientResponse<E>>
      : E["query"] extends z.ZodTypeAny
      ? (
          path: ExtractClientPath<E>,
          query: ExtractClientQuery<E>
        ) => Promise<ExtractClientResponse<E>>
      : (path: ExtractClientPath<E>) => Promise<ExtractClientResponse<E>>
    : E["body"] extends z.ZodTypeAny
    ? (
        body: ExtractClientBody<E>,
        options?: { query?: ExtractClientQuery<E> }
      ) => Promise<ExtractClientResponse<E>>
    : E["query"] extends z.ZodTypeAny
    ? (query: ExtractClientQuery<E>) => Promise<ExtractClientResponse<E>>
    : () => Promise<ExtractClientResponse<E>>;

// type ClientFunction<E extends AnyEndpoint> = (
//   ...args: ClientArgs<E>
// ) => Promise<ClientResponse<E>>;

////////////////////////////////////////////////////////
// VOID RESPONSE TESTS
////////////////////////////////////////////////////////
{
  endpoint({ handler() {} });
  endpoint({ async handler() {} });

  endpoint({
    // @ts-expect-error should return void
    handler() {
      return "a";
    },
  });
  endpoint({
    // @ts-expect-error should return void
    async handler() {
      return "a";
    },
  });

  const ep = endpoint({
    handler(request) {},
  });
  const a: ExtractClientResponse<typeof ep> = undefined;
  // @ts-expect-error should be undefined
  const b: ExtractClientResponse<typeof ep> = null;
  // @ts-expect-error should be undefined
  const c: ExtractClientResponse<typeof ep> = "a";
}

/////////////////////////////////////////////////////////
// STRING RESPONSE TESTS
/////////////////////////////////////////////////////////
{
  endpoint({
    response: z.string(),
    handler: () => "a",
  });
  endpoint({
    response: z.string(),
    handler: async () => "a",
  });
  endpoint({
    response: z.string(),
    // @ts-expect-error should return string
    handler: () => 1,
  });
  endpoint({
    response: z.string(),
    // @ts-expect-error should return string
    handler: async () => 1,
  });

  const ep = endpoint({
    response: z.string(),
    handler: () => "a",
  });
  const a: ExtractClientResponse<typeof ep> = "a";
  // @ts-expect-error should be string
  const b: ExtractClientResponse<typeof ep> = undefined;
  // @ts-expect-error should be string
  const c: ExtractClientResponse<typeof ep> = null;
  // @ts-expect-error should be string
  const d: ExtractClientResponse<typeof ep> = 1;
  // @ts-expect-error should be string
  const e: ExtractClientResponse<typeof ep> = {};
}

/////////////////////////////////////////////////////////
// RESOLVED RESPONSE TESTS
/////////////////////////////////////////////////////////
{
  endpoint({
    response: z.string().transform((data) => ({ data })),
    handler: () => "a",
  });
  endpoint({
    response: z.string().transform((data) => ({ data })),
    handler: async () => "a",
  });
  endpoint({
    response: z.string().transform((data) => ({ data })),
    // @ts-expect-error should return string
    handler: () => 1,
  });
  endpoint({
    response: z.string().transform((data) => ({ data })),
    // @ts-expect-error should return string
    handler: async () => 1,
  });
  endpoint({
    response: z.string().transform((data) => ({ data })),
    // @ts-expect-error should return string
    handler: async () => ({ data: a }),
  });

  const ep = endpoint({
    response: z.string().transform((data) => ({ data })),
    handler: () => "a",
  });
  const a: ExtractClientResponse<typeof ep> = { data: "a" };
  // @ts-expect-error should be { data: string }
  const b: ExtractClientResponse<typeof ep> = undefined;
  // @ts-expect-error should be { data: string }
  const c: ExtractClientResponse<typeof ep> = null;
  // @ts-expect-error should be { data: string }
  const d: ExtractClientResponse<typeof ep> = 1;
  // @ts-expect-error should be { data: string }
  const e: ExtractClientResponse<typeof ep> = {};
  // @ts-expect-error should be { data: string }
  const f: ExtractClientResponse<typeof ep> = { data: 1 };
  // @ts-expect-error should be { data: string }
  const g: ExtractClientResponse<typeof ep> = "a";
}

//////////////////////////////////////////////////////////
// QUERY ONLY TESTS
//////////////////////////////////////////////////////////
{
  endpoint({
    query: z.object({ userId: z.string() }),
    handler({ userId }: { userId: string }) {},
  });
  endpoint({
    query: z
      .object({ userId: z.string() })
      .transform(({ userId }) => ({ user: "a" })),
    handler({ user }: { user: string }) {},
  });

  endpoint({
    query: z.object({ userId: z.string() }),
    handler({
      userId,
      // @ts-expect-error invalid property
      invalid,
    }) {},
  });
  endpoint({
    query: z
      .object({ userId: z.string() })
      .transform(({ userId }) => ({ user: "a" })),
    // @ts-expect-error should take query output
    handler({ userId }) {},
  });

  const ep = endpoint({
    query: z
      .object({ userId: z.string() })
      .transform(({ userId }) => ({ user: "a" })),
    handler() {},
  });

  const a: ExtractClientQuery<typeof ep> = { userId: "a" };
  // @ts-expect-error should be input type
  const b: ExtractClientQuery<typeof ep> = { user: "a" };
  // @ts-expect-error excess property
  const c: ExtractClientQuery<typeof ep> = { userId: "a", excess: "b" };
  // @ts-expect-error invalid property type
  const d: ExtractClientQuery<typeof ep> = { userId: 1 };

  // @ts-expect-error should be undefined
  const e: ExtractClientBody<typeof ep> = null;
  // @ts-expect-error should be undefined
  const f: ExtractClientBody<typeof ep> = "a";
  // @ts-expect-error should be undefined
  const g: ExtractClientBody<typeof ep> = { userId: "a" };

  // @ts-expect-error should be undefined
  const h: ExtractClientPath<typeof ep> = null;
  // @ts-expect-error should be undefined
  const i: ExtractClientPath<typeof ep> = "a";
  // @ts-expect-error should be undefined
  const j: ExtractClientPath<typeof ep> = { userId: "a" };

  const fn0: ClientFunction<typeof ep> = async () => {};

  const fn1: ClientFunction<typeof ep> = async (query: {
    userId: string;
  }) => {};

  // @ts-expect-error arg should be { userId: string }
  const fn2: ClientFunction<typeof ep> = async (arg: string) => {};
  // @ts-expect-error excess property
  const fn3: ClientFunction<typeof ep> = async (query: {
    userId: string;
    invalid: number;
  }) => {};
  // @ts-expect-error invalid property type
  const fn4: ClientFunction<typeof ep> = async (query: {
    userId: number;
  }) => {};
}

//////////////////////////////////////////////////////////
// QUERY AND BODY TESTS
//////////////////////////////////////////////////////////
{
  endpoint({
    query: z.object({ userId: z.string() }),
    body: z.object({ postId: z.string() }),
    handler({ userId, postId }: { userId: string; postId: string }) {},
  });
  endpoint({
    query: z
      .object({ userId: z.string() })
      .transform(({ userId }) => ({ user: "a" })),
    body: z
      .object({ postId: z.string() })
      .transform(({ postId }) => ({ post: "a" })),
    handler({ user, post }: { user: string; post: string }) {},
  });

  endpoint({
    query: z.object({ userId: z.string() }),
    body: z
      .object({ postId: z.string() })
      .transform(({ postId }) => ({ post: "a" })),
    handler({
      userId,
      post,
      // @ts-expect-error invalid property
      invalid,
    }) {},
  });
  endpoint({
    query: z
      .object({ userId: z.string() })
      .transform(({ userId }) => ({ user: "a" })),
    body: z
      .object({ postId: z.string() })
      .transform(({ postId }) => ({ post: "a" })),
    // @ts-expect-error should take query output
    handler({ userId }) {},
  });
  endpoint({
    query: z
      .object({ userId: z.string() })
      .transform(({ userId }) => ({ user: "a" })),
    body: z
      .object({ postId: z.string() })
      .transform(({ postId }) => ({ post: "a" })),
    // @ts-expect-error should take body output
    handler({ user, postId }) {},
  });

  const ep = endpoint({
    query: z
      .object({ userId: z.string() })
      .transform(({ userId }) => ({ user: "a" })),
    body: z
      .object({ postId: z.string() })
      .transform(({ postId }) => ({ post: "a" })),
    handler() {},
  });

  const a: ExtractClientQuery<typeof ep> = { userId: "a" };
  // @ts-expect-error should be input type
  const b: ExtractClientQuery<typeof ep> = { user: "a" };
  // @ts-expect-error excess property
  const c: ExtractClientQuery<typeof ep> = { userId: "a", excess: "b" };
  // @ts-expect-error invalid property type
  const d: ExtractClientQuery<typeof ep> = { userId: 1 };

  const e: ExtractClientBody<typeof ep> = { postId: "a" };
  // @ts-expect-error should be input type
  const f: ExtractClientBody<typeof ep> = { post: "a" };
  // @ts-expect-error excess property
  const g: ExtractClientBody<typeof ep> = { postId: "a", excess: "b" };
  // @ts-expect-error invalid property type
  const h: ExtractClientBody<typeof ep> = { postId: 1 };

  // @ts-expect-error should be undefined
  const i: ExtractClientPath<typeof ep> = null;
  // @ts-expect-error should be undefined
  const j: ExtractClientPath<typeof ep> = "a";
  // @ts-expect-error should be undefined
  const k: ExtractClientPath<typeof ep> = { userId: "a" };

  const fn0: ClientFunction<typeof ep> = async () => {};
  const fn1: ClientFunction<typeof ep> = async (
    body: { postId: string },
    options?: { query?: { userId: string } }
  ) => {};

  // @ts-expect-error options should be optional
  const fn2: ClientFunction<typeof ep> = async (
    body: { postId: string },
    options: { query?: { userId: string } }
  ) => {};
  // @ts-expect-error incorrect postId type
  const fn3: ClientFunction<typeof ep> = async (
    body: { postId: number },
    options: { query?: { userId: string } }
  ) => {};
  // @ts-expect-error excess body property
  const fn3: ClientFunction<typeof ep> = async (
    body: { postId: string; excess: string },
    options: { query?: { userId: string } }
  ) => {};
  // @ts-expect-error excess query property
  const fn4: ClientFunction<typeof ep> = async (
    body: { postId: string },
    options: { query?: { userId: string; excess: string } }
  ) => {};
  // @ts-expect-error missing query
  const fn5: ClientFunction<typeof ep> = async (
    body: { postId: string },
    options: {}
  ) => {};
  // @ts-expect-error missing body
  const fn6: ClientFunction<typeof ep> = async (options: {
    query?: { userId: string; excess: string };
  }) => {};
}

//////////////////////////////////////////////////////////
// PATH AND BODY TESTS
//////////////////////////////////////////////////////////
{
  endpoint({
    path: z.object({ userId: z.string() }),
    body: z.object({ postId: z.string() }),
    handler({ userId, postId }: { userId: string; postId: string }) {},
  });
  endpoint({
    path: z
      .object({ userId: z.string() })
      .transform(({ userId }) => ({ user: "a" })),
    body: z
      .object({ postId: z.string() })
      .transform(({ postId }) => ({ post: "a" })),
    handler({ user, post }: { user: string; post: string }) {},
  });

  endpoint({
    path: z.object({ userId: z.string() }),
    body: z
      .object({ postId: z.string() })
      .transform(({ postId }) => ({ post: "a" })),
    handler({
      userId,
      // @ts-expect-error invalid property
      invalid,
    }) {},
  });
  endpoint({
    path: z
      .object({ userId: z.string() })
      .transform(({ userId }) => ({ user: "a" })),
    body: z
      .object({ postId: z.string() })
      .transform(({ postId }) => ({ post: "a" })),
    // @ts-expect-error should take query output
    handler({ userId }) {},
  });

  const ep = endpoint({
    path: z
      .object({ userId: z.string() })
      .transform(({ userId }) => ({ user: "a" })),
    body: z
      .object({ postId: z.string() })
      .transform(({ postId }) => ({ post: "a" })),
    handler() {},
  });

  const a: ExtractClientPath<typeof ep> = "a";
  // @ts-expect-error should be ValueOf<input type>
  const b: ExtractClientPath<typeof ep> = 1;

  const e: ExtractClientBody<typeof ep> = { postId: "a" };
  // @ts-expect-error should be input type
  const f: ExtractClientBody<typeof ep> = { post: "a" };
  // @ts-expect-error excess property
  const g: ExtractClientBody<typeof ep> = { postId: "a", excess: "b" };
  // @ts-expect-error invalid property type
  const h: ExtractClientBody<typeof ep> = { postId: 1 };

  const fn0: ClientFunction<typeof ep> = null as any;
  const fn1: ClientFunction<typeof ep> = async (
    path: string,
    body: { postId: string },
    options?: { query?: undefined }
  ) => {};
  // @ts-expect-error missing path
  const fn2: ClientFunction<typeof ep> = async (
    body: { postId: string },
    options?: { query?: undefined }
  ) => {};
  // @ts-expect-error incorrect path type
  const fn3: ClientFunction<typeof ep> = async (
    path: number,
    body: { postId: string },
    options?: { query?: undefined }
  ) => {};
  // @ts-expect-error incorrect body type
  const fn4: ClientFunction<typeof ep> = async (
    path: string,
    body: string,
    options?: { query?: undefined }
  ) => {};
  // @ts-expect-error incorrect postId type
  const fn5: ClientFunction<typeof ep> = async (
    path: string,
    body: { postId: number },
    options?: { query?: undefined }
  ) => {};
  // @ts-expect-error excess path property
  const fn6: ClientFunction<typeof ep> = async (
    path: string,
    path2: string,
    body: { postId: string },
    options?: { query?: undefined }
  ) => {};
  // @ts-expect-error excess body property
  const fn7: ClientFunction<typeof ep> = async (
    path: string,
    body: { postId: string; excess: string },
    options?: { query?: undefined }
  ) => {};
  // @ts-expect-error excess query property
  const fn8: ClientFunction<typeof ep> = async (
    path: string,
    body: { postId: string; excess: string },
    options?: { query?: { foo: number } }
  ) => {};
  // @ts-expect-error missing body
  const fn9: ClientFunction<typeof ep> = async (
    path: string,
    options?: { query?: undefined }
  ) => {};
}
