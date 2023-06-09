---
sidebar_position: 1
---

# Add user to Stainless context

You may wish to set a current user property on the Stainless context.
Here's how you can create a custom plugin to do that:

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

import { Stl } from "stainless";
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

export const stl = new Stl<StlUserContext, typeof plugins>({
  plugins,
});
```
