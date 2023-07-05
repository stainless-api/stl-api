---
sidebar_position: 0
---

# Getting started

## Create client

:::info

Make sure to use `import type` to import your api declaration,
to make sure you don't import any server-side runtime code on the client.

:::

```ts
// ~/api/client.ts

import { createClient } from "stainless";
import type { api } from "./index";

export const client = createClient<typeof api>("/api");
```
