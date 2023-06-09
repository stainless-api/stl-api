---
sidebar_position: 1
---

# Getting started

:::caution

This is alpha software, and we may make significant changes in the coming months.
But we're eager for you to try it out and let us know what you think!

:::

At the moment, Stainless can be used with Next.js. Support for
standalone and Express apps is coming soon.
We will soon provide a `create-stl-app` API. Until then:

## Installation

```bash
npm i --save  stainless-api/stl-api#stainless-0.0.2 \
              stainless-api/stl-api#next-0.0.2 \
              stainless-api/react-query#stainless-0.0.2

# Optional plugins:
npm i --save stainless-api/stl-api#next-auth-0.0.2  # If you are using next-auth
npm i --save stainless-api/stl-api#prisma-0.0.2     # If you are using Prisma
```

## Create Stainless instance

```ts
// ~/libs/stl.ts

import { Stl } from "stainless";
import { makeNextPlugin } from "@stl-api/next";

export type Context = {};

const plugins = {
  next: makeNextPlugin(),
};

export const stl = new Stl<Context, typeof plugins>({
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

    username: z.string().nullable(),
    email: z.string().nullable(),
    name: z.string().nullable(),

    createdAt: z.date(),
    updatedAt: z.date(),

    followingIds: z.array(z.string().uuid()),
    hasNotification: z.boolean().nullable(),
    followersCount: z.number(),
  })
  .prismaModel(prisma.user);
```

## Create an endpoint

```ts
// ~/api/users/retrieve.ts

import { stl } from "~/libs/stl";
import { NotFoundError, z } from "stainless";
import prisma from "~/libs/prismadb";
import { User } from "./models";

export const retrieve = stl.endpoint({
  endpoint: "get /api/users/{userId}",
  response: User,
  path: z.object({
    userId: z.string(),
  }),
  async handler({ userId }, ctx) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundError();
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

:::caution

Currently the names of `resources` have to match the URL paths for
the [client](#use-client) to work. For example if the base URL is
`/api` and there is a `get /api/users` endpoint, the resource must
be named `users` here. If it were named `user`, then `client.user.list(...)`
would `GET /api/user`, the wrong URL. We plan to make a build watch
process to compile a list of endpoint URLs for the client to remove
this limitation.

:::

## Add API route

```ts
// ~/app/api/[...catchall]/route.ts

import { api } from "~/api/index";
import { stlNextAppCatchAllRouter } from "@stl-api/next";

const { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS } =
  stlNextAppCatchAllRouter(api, {
    catchAllParam: "catchall",
  });

export { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS };
```

## Create client

```ts
// ~/api/client.ts

import { createReactQueryClient } from "@stl-api/react-query";
import type { api } from "./index";

export const client = createReactQueryClient<typeof api>("/api");
```

## Use client

```ts
// ~/app/users/[userId]/page.tsx

import * as React from "react";
import client from "~/api/client.ts";

export default function UserPage({
  params: { userId },
}: {
  params: { userId: string };
}): React.ReactElement {
  const { status, error, data: user } = client.users.useRetrieve(userId);

  if (status === "loading") return <LoadingAlert>Loading user...</LoadingAlert>;
  if (error) return <ErrorAlert error={error} />;

  return <UserDetailsPanel user={user}>
}
```
