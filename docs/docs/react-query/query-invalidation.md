---
sidebar_position: 5
---

# Query Invalidation

Right now to invalidate queries you have to use
`client.<Resource>.<Action>.getQueryKey([path], [query])` to get the `queryKey` to pass
to `QueryClient.invalidateQueries`.

In the future, we plan to add methods like `client.<Resource>.invalidateQueries()` and
`client.<Resource>.<Action>.invalidateQueries([path], [query])`.

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
      queryKey: client.posts.list.getQueryKey(),
    });
  }, []);

  // ...
};
```
