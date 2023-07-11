---
sidebar_position: 4
---

# Query Invalidation

Right now to invalidate queries you have to use `useClient().<resource>.getQueryKey()` or `useClient().<resource>.<method>.getQueryKey([path], [query])` to get the `queryKey` to pass to `QueryClient.invalidateQueries`.

In the future, we plan to add methods like `useClient().<resource>.invalidateQueries()` and
`useClient().<resource>.<method>.invalidateQueries([path], [query])`.

```ts
import * as React from "react";

import { useClient } from "~/api/useClient";
import { useQueryClient } from "@tanstack/react-query";

const RefreshPostsButton: React.FC<FormProps> = ({
  placeholder,
  isComment,
  postId,
}) => {
  const client = useClient();
  const queryClient = useQueryClient();

  const refresh = React.useCallback(() => {
    queryClient.invalidatePost({
      queryKey: client.posts.getQueryKey(),
    });
    // or:
    queryClient.invalidatePost({
      queryKey: client.posts.list.getQueryKey(),
    });
  }, []);

  // ...
};
```
