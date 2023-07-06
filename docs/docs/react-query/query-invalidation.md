---
sidebar_position: 3
---

# Query Invalidation

`createReactQueryClient` adds `invalidateQueries` methods to each resource, and for each `list`, `retrieve`, etc. method it
adds an `invalidateList`, `invalidateRetrieve`, etc. method next to it:

```ts
import * as React from "react";

import { client } from "~/api/client";
import { useQueryClient } from "@tanstack/react-query";

const RefreshPostsButton: React.FC<FormProps> = ({
  placeholder,
  isComment,
  postId,
}) => {
  const queryClient = useQueryClient();

  const refresh = React.useCallback(() => {
    client.posts.invalidateQueries(queryClient);
    // or:
    client.posts.invalidateList(queryClient);
  }, []);

  // ...
};
```
