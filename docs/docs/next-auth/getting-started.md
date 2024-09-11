---
sidebar_position: 0
---

# Getting started

:::caution

This is alpha software, and we may make significant changes in the coming months.
We're eager for you to try it out and let us know what you think!

:::

This guide assumes you've already set up [@stl-api/next](/stl/next/getting-started).

## Installation

```
npm i --save next-auth 'stainless-api/stl-api#next-auth-0.0.3'
```

## Add `[...nextauth]` route

Here is an example using `prisma`:

```ts
// ~/pages/api/auth/[...nextauth].ts

import bcrypt from "bcrypt";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "~/libs/prismadb";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user?.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
```

## Add plugin to Stainless instance

```diff
// ~/libs/stl.ts

import { Stl } from "stainless";
import { makeNextPlugin } from "@stl-api/next";
+import { makeNextAuthPlugin } from "@stl-api/next-auth";
+import { authOptions } from "~/pages/api/auth/[...nextauth]";

const plugins = {
  next: makeNextPlugin(),
+  nextAuth: makeNextAuthPlugin({ authOptions }),
};

export const stl = new Stl({
  plugins,
});
```

## Setting a route to be authenticated

If you have an endpoint where you only want to respond when incoming
requests are authenticated, you can mark it as `authenticated`:

```diff
// ~/api/users/retrieve.ts

import { stl } from "~/libs/stl";
import { z } from "stainless";
import prisma from "~/libs/prismadb";
import { User } from "./models";

export const retrieve = stl.endpoint({
  endpoint: "GET /api/users/{userId}",

+  config: {
+    authenticated: true,
+  }

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

Now, if an unauthenticated request hits the endpoint, the plugin will
automatically raise an `UnauthorizedError`, causing the request to resolve
to an HTTP 401 status. `ctx.session` and `ctx.session.user` are also made
available to the `handler`, so handling authenticated request session
information is easier.
