# @stl-api/next-auth: next-auth plugin for Stainless API

Use this plugin to add `next-auth` session to Stainless API
context.

# Getting started

This guide assumes you've already set up [@stl-api/next](/packages/next).

## Installation

```
npm i --save next-auth stainless-api/stl-api#next-auth-0.0.1
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

import { makeStl } from "stainless";
import { makeNextPlugin } from "@stl-api/next";
+import { makeNextAuthPlugin } from "@stl-api/next-auth";
+import { authOptions } from "~/pages/api/auth/[...nextauth]";

export type StlUserContext = {};

const plugins = {
  next: makeNextPlugin(),
+  nextAuth: makeNextAuthPlugin({ authOptions }),
};

export const stl = makeStl<StlUserContext, typeof plugins>({
  plugins,
});
```

## Optional: make a custom plugin to add the current user to Stainless context

```ts
// ~/libs/currentUserPlugin.ts

import {
  AnyEndpoint,
  MakeStainlessPlugin,
  Params,
  PartialStlContext,
} from "stainless";
import { StlUserContext } from "./stl";

export const makeCurrentUserPlugin =
  (): MakeStainlessPlugin<StlUserContext> => (stl) => ({
    async middleware<EC extends AnyEndpoint>(
      endpoint: EC,
      params: Params,
      context: PartialStlContext<StlUserContext, EC>
    ) {
      const { session } = context;

      // session?.user is exactly what was returned from authorize(),
      // but doesn't have complete type information
      context.currentUser = session?.user as any;
    },
  });
```

```diff
// ~/libs/stl.ts

import { makeStl } from "stainless";
import { makeNextPlugin } from "@stl-api/next";
import { makeNextAuthPlugin } from "@stl-api/next-auth";
import { makeCurrentUserPlugin } from "./currentUserPlugin";
import { authOptions } from "~/pages/api/auth/[...nextauth]";

-export type StlUserContext = {};
+export type StlUserContext = {
+  currentUser?: User;
+};

const plugins = {
  next: makeNextPlugin(),
  nextAuth: makeNextAuthPlugin({ authOptions }),
+  currentUser: makeCurrentUserPlugin(),
};

export const stl = makeStl<StlUserContext, typeof plugins>({
  plugins,
});
```
