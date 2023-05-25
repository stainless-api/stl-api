# `stainless`: Stainless server and client framework

Stainless helps you ship quality, typesafe REST APIs from any TypeScript backend.

You declare the shape and behavior of your API in one place,
and get an OpenAPI spec, docs, and typed frontend client without a build step.

You can use it as a pluggable, batteries-included web framework for APIs (managing auth, pagination, observability, etc) or sprinkle it on top of your existing API in any framework for better OpenAPI support and/or full-stack typesafety.

You can also opt into Stainless's Stripe-inspired [pristine API design conventions](/README.md#pristine-conventions) and get rich pagination, consistent errors, field expansion & selection, and (WIP) normalized caching on the frontend for free.

Stainless draws inspiration with gratitude from tRPC, FastAPI, GraphQL/Relay, and (heavily) from the internal API Framework we worked on at Stripe.

# Table of Contents

- [`stainless`: Stainless server and client framework](#stainless-stainless-server-and-client-framework)
- [Table of Contents](#table-of-contents)
- [Ecosystem](#ecosystem)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Create Stainless instance](#create-stainless-instance)
  - [Create a model](#create-a-model)
  - [Create an endpoint](#create-an-endpoint)
  - [Create a resource](#create-a-resource)
  - [Create API](#create-api)
  - [Add API route](#add-api-route)
  - [Create client](#create-client)
  - [Use client](#use-client)
- [In-depth topics](#in-depth-topics)
  - [Pagination](#pagination)
  - [Expansion](#expansion)
  - [Selection](#selection)

# Ecosystem

Stainless provides plugins for integrating with the following tools. We plan to add more in the future!

- Next.js: [`@stl-api/next`](/packages/next)
- NextAuth.js: [`@stl-api/next-auth`](/packages/next-auth)
- Prisma: [`@stl-api/prisma`](/packages/prisma)

# Getting Started

At the moment, Stainless can be used with Next.js. Support for
standalone and Express apps is coming soon.
We will soon provide a `create-stl-app` API. Until then:

## Installation

```
npm i --save stainless @stl-api/next

# Optional plugins:
npm i --save @stl-api/next-auth  # If you are using next-auth
npm i --save @stl-api/prisma     # If you are using Prisma
```

## Create Stainless instance

```ts
// ~/libs/stl.ts

import { makeStl } from "stainless";
import { makePrismaPlugin } from "@stl-api/prisma";
import { makeNextPlugin } from "@stl-api/next";
import { makeNextAuthPlugin } from "@stl-api/next-auth";
import { authOptions } from "~/pages/api/auth/[...nextauth]";

export type StlUserContext = {};

const plugins = {
  next: makeNextPlugin(),
  nextAuth: makeNextAuthPlugin({ authOptions }),
  prisma: makePrismaPlugin(),
  currentUser: makeCurrentUserPlugin(),
};

export const stl = makeStl<StlUserContext, typeof plugins>({
  plugins,
});
```

## Create a model

```ts
// ~/api/users/models.ts

import { z } from "stainless";
import prisma from "~/libs/prisma";

export const User = z
  .response({
    id: z.string().uuid(),

    name: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    emailVerified: z.date().nullable().optional(),
    image: z.string().nullable().optional(),
    coverImage: z.string().nullable().optional(),
    profileImage: z.string().nullable().optional(),

    hashedPassword: z.string().nullable().optional(),

    createdAt: z.date(),
    updatedAt: z.date(),

    followingIds: z.array(z.string().uuid()),
    hasNotification: z.boolean().nullable().optional(),
    followersCount: z.number().optional(),
  })
  .prismaModel(prisma.user);
```

## Create an endpoint

```ts
// ~/api/users/retrieve.ts

import { stl } from "~/libs/stl";
import z from "zod";
import prisma from "~/libs/prismadb";
import { User } from "./models";

export const retrieve = stl.endpoint({
  endpoint: "get /api/users/{userId}",
  path: z.object({
    userId: z.string(),
  }),
  response: User,
  async handler({ userId }, ctx) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new stl.NotFoundError();
    return user;
  },
});
```

## Create a resource

```ts
// ~/api/users/index.ts

import { stl } from "~/libs/stl";
import { retrieve } from "./retrieve";
import { User } from "./models";

export const users = stl.resource({
  summary: "Users",
  models: {
    User,
  },
  actions: {
    retrieve,
  },
});
```

## Create API

```ts
// ~/api/index.ts

import { stl } from "~/libs/stl";
import { users } from "./users";

export const api = stl.api({
  openapi: {
    endpoint: "get /api/openapi",
  },
  resources: {
    users,
  },
});
```

> **Warning**
>
> Currently the names of `resources` have to match the URL paths for
> the [client](#use-client) to work. For example if the base URL is
> `/api` and there is a `get /api/users` endpoint, the resource must
> be named `users` here. If it were named `user`, then `client.user.list(...)`
> would `GET /api/user`, the wrong URL. We plan to make a build watch
> process to compile a list of endpoint URLs for the client to remove
> this limitation.

## Add API route

```ts
// ~/app/api/[...catchall]/route.ts

import { api } from "~/api/index";
import { stl } from "~/libs/stl";

const { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS } =
  stl.plugins.next.appCatchAllRouter(api, {
    catchAllParam: "catchall",
  });

export { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS };
```

## Create client

```ts
// ~/api/client.ts

import { createClient } from "stainless";
import type { api } from "./index";

export const client = createClient<typeof api>("/api");
```

## Use client

```ts
// ~/app/users/[userId]/page.tsx

import * as React from "react";
import client from "~/api/client.ts";
import { useQuery } from "@tanstack/react-query";

export default function UserPage({
  params: { userId },
}: {
  params: { userId: string };
}): React.ReactElement {
  const { status, error, data: user } = useQuery({
    queryKey: [`users/${userId}`],
    queryFn: () => client.users.retrieve(userId),
  });

  if (status === "loading") return <LoadingAlert>Loading user...</LoadingAlert>;
  if (error) return <ErrorAlert error={error} />;

  return <UserDetailsPanel user={user}>
}
```

> **Note**
> We may provide a plugin that adds `client.users.useRetrieve` hooks in the future.

# In-depth topics

## [Pagination](/packages/stainless/docs/pagination.md)

Stainless provides helpers for easily implementing pagination that follows the pristine
convention, and makes it easy to implement pagination with Prisma.

## [Expansion](/packages/stainless/docs/expansion.md)

Expansion allows you to optionally include associated objects in an API response if the
user requests them in an `expand` query parameter. Stainless makes it easy to implement
expansion with Prisma.

## [Selection](/packages/stainless/docs/selection.md)

Selection allows you to pick what subset of fields on an associated object are returned
in an API response, if the user requests them in a `select` query parameter. Stainless
makes it easy to implement selection with Prisma.
