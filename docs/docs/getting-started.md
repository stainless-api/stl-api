---
sidebar_position: 1
---

# Getting started

At the moment, Stainless can be used with Next.js. Support for
standalone and Express apps is coming soon.
We will soon provide a `create-stl-app` API. Until then:

## Installation

```bash
npm i --save stainless-api/stl-api#stainless-0.0.1 stainless-api/stl-api#next-0.0.1

# Optional plugins:
npm i --save stainless-api/stl-api#next-auth-0.0.1  # If you are using next-auth
npm i --save stainless-api/stl-api#prisma-0.0.1     # If you are using Prisma
```

## Create Stainless instance

```ts
// ~/libs/stl.ts

import { makeStl } from "stainless";
import { makeNextPlugin } from "@stl-api/next";

export type Context = {};

const plugins = {
  next: makeNextPlugin(),
};

export const stl = makeStl<Context, typeof plugins>({
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
import { z } from "stainless";
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