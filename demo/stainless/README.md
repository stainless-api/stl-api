# Stainless: a framework for robust & polished REST APIs

`stainless` helps you ship quality, typesafe REST APIs from any TypeScript backend.

You declare the shape and behavior of your API in one place,
and get an OpenAPI spec, docs, and typed frontend client without a build step.

You can use it as a pluggable, batteries-included web framework for APIs (managing auth, pagination, observability, etc) or sprinkle it on top of your existing API in any framework for better OpenAPI support and/or full-stack typesafety.

You can also opt into Stainless's Stripe-inspired [pristine](#pristine) API design conventions and get rich pagination, consistent errors, field expansion & selection, and normalized caching on the frontend for free.

`stainless` draws inspiration with gratitude from tRPC, FastAPI, GraphQL/Relay, and (heavily) from the internal API Framework we worked on at Stripe.

For example:

<!-- TODO: this is too long / too much code… -->
```ts
// server.ts
import { Stainless } from "stainless";
import { next, nextAuth, prisma } from "stainless/plugins";

const stl = new Stainless({ plugins: { next, nextAuth, prisma } });

const User = z.object({
  id: z.string(),
  name: z.string(),
});

const update = stl.endpoint({
  endpoint: "post /users/:id",
  description: "Update a user. Currently only updating the name is supported.",
  authenticated: true,

  path: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string(),
  }),
  response: User,

  async handler({ id, name }) {
    return await prisma.users.updateOne(id, { name });
  },
});

export const api = stl.api({
  resources: {
    users: stl.resource({
      actions: {
        update,
      },
      models: {
        User,
      },
    }),
  },
});

// client.ts
import { Client } from "stainless/client";
import type { api } from "./server";

const client = new Client<typeof api>("http://localhost:3000");

// params are fully typed:
const user = await client.users.update("id", { name: "my new name" });
// user object is fully typed.

// A full OpenAPI spec is available by default at "get /openapi":
const openapi = await client.getOpenAPI();
console.log(openapi.paths["/users/:id"].post);
console.log(openapi.components.schemas.User);
```

# Pristine

Pristine is an API Standard by Stainless, providing opinions on API design so teams don't have to bikeshed, and so tools can expect consistent API shapes.

Following the Pristine Standard helps your API offer an interface like Stripe's,
with best-practices baked in. Like the Relay standard for GQL, Pristine can also help tooling like frontend clients cache data, paginate requests, handle errors, and so on.

You can opt your API into Pristine like so:

```ts
const stl = new Stainless({ pristine: true })
```

This will enforce the Pristine conventions, and provide easier access to tooling which depends on it.

If you're starting with an existing API and don't want to go straight to a v2,
you can gradually adopt Pristine standards and tooling. In the future, we plan to offer lint rules for your OpenAPI spec and an overall "Lighthouse score" indicating the degree of compliance your API offers.

## Pristine Conventions

Here is a list of Pristine API design conventions:

- TODO

# Using Stainless in an existing codebase

If you'd like a maintainable way of declaring your OpenAPI spec
in TypeScript, right alongside your application code, and getting
great docs, end-to-end typesafety, and backend API client libraries (SDKs),
you can adopt the `stainless` library gradually in minimally-invasive ways.

For example, in an Express app, you can add annotations near a handler to get an OpenAPI spec and client:

```ts
// app/routes/users.ts

const User = z.object({
  id: z.string(),
  name: z.string(),
})

const create = stl.endpoint({
  endpoint: 'post /users',
  body: z.object({ name: z.string() }),
  response: User,
})

app.post('/users', async (req, rsp) => {
  const user = await db.users.create({ name })
  rsp.status(200).json(user)
})
```

<details>
<summary>You'll also need a small amount of server code</summary>

```ts
// app/api.ts
const users = stl.resource({
  models: { User },
  methods: {
    create,
  },
})

const api = stl.api({
  resources: {
    users,
  }
})

// and voila, you get an OpenAPI spec!
app.get('/openapi', (req, rsp) => {
  rsp.json(api.openapi.spec)
})
```
</summary>

For typesafety and validation of parameters, you can also sprinkle in
param parsing, response generation, and more:

```ts
app.post('/users', async (req, rsp) => {
  const { name } = create.validateParams(req)

  const user = await db.users.create({ name })

  rsp.send(create.makeResponse(user))
})
```

Doing this helps TypeScript ensure that your OpenAPI spec is an accurate reflection of your runtime behavior. It can also help return consistent response shapes and validation error messages to the user.

Note that `validateParams` raises `stl.BadRequestError` if params don't match.

To handle errors like this, add middleware:

```ts
app.use((err, req, rsp, next) => {
  if (err instanceof stl.Error) {
    rsp.status(err.statusCode).send(stl.makeError(err))
  }
  // …
})
```

`stl.makeError` is will return a JSON object with `type`, `message`, and other information. (TODO add/encourage things like request ID's…)
